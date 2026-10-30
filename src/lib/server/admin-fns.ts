import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type {
  Achievement,
  Article,
  Category,
  Certification,
  Faq,
  Milestone,
  Partner,
  Program,
  Settings,
  Testimonial,
} from "@/lib/types";
import { isEmail, slugify, youtubeId } from "@/lib/utils";

const COOKIE = "dk_admin";

type Fail = { ok: false; error: string };
type Admin = { id: string; email: string; name: string };
type AdminArticle = Omit<Article, "category_en" | "category_hi" | "published_on" | "tags"> & {
  publish_on: string;
};

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

async function hashSecret(value: string) {
  const { randomBytes, scrypt } = await import("node:crypto");
  const { promisify } = await import("node:util");
  const salt = randomBytes(16).toString("hex");
  const derived = (await promisify(scrypt)(value, salt, 32)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function checkSecret(value: string, stored: string) {
  const parts = stored.split("$");
  if (parts[0] !== "scrypt" || !parts[1] || !parts[2]) return false;
  const { scrypt, timingSafeEqual } = await import("node:crypto");
  const { promisify } = await import("node:util");
  const derived = (await promisify(scrypt)(value, parts[1], 32)) as Buffer;
  const current = Buffer.from(parts[2], "hex");
  if (current.length !== derived.length) return false;
  return timingSafeEqual(current, derived);
}

async function ipHash() {
  const { getRequestIP } = await import("@tanstack/react-start/server");
  const { createHash } = await import("node:crypto");
  return createHash("sha256")
    .update(getRequestIP({ xForwardedFor: true }) ?? "unknown")
    .digest("hex");
}

async function assertMutation() {
  const { getRequestHeaders, getRequestHost } = await import("@tanstack/react-start/server");
  const headers = getRequestHeaders();
  const site = headers.get("sec-fetch-site");
  if (site && site !== "same-origin") throw new Error("forbidden");
  const origin = headers.get("origin");
  if (!origin) return;
  const host = getRequestHost({ xForwardedHost: true });
  if (new URL(origin).host !== host) throw new Error("forbidden");
}

async function setSessionCookie(adminId: string) {
  const { randomBytes, createHash, randomUUID } = await import("node:crypto");
  const { setCookie, getRequestProtocol } = await import("@tanstack/react-start/server");
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const sql = await getSql();
  await sql`insert into admin_sessions (id, admin_id, token_hash, expires_at)
    values (${randomUUID()}, ${adminId}, ${tokenHash}, now() + interval '12 days')`;
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: getRequestProtocol({ xForwardedProto: true }) === "https",
    maxAge: 60 * 60 * 24 * 12,
  });
}

async function requireAdmin(): Promise<Admin | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const token = getCookie(COOKIE);
  if (!token) return null;
  const { createHash } = await import("node:crypto");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const sql = await getSql();
  const rows = await sql<Admin>`select u.id, u.email, u.name
    from admin_sessions s
    join admin_users u on u.id = s.admin_id
    where s.token_hash = ${tokenHash} and s.expires_at > now()
    limit 1`;
  return rows[0] ?? null;
}

async function guard(): Promise<Admin | Fail> {
  try {
    await assertMutation();
  } catch {
    return { ok: false, error: "forbidden" };
  }
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "unauthorized" };
  return admin;
}

function failed(value: Admin | Fail): value is Fail {
  return "ok" in value && value.ok === false;
}

export const getSetupState = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*) as n from admin_users`;
  return { needsSetup: Number(rows[0]?.n ?? 0) === 0 };
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireAdmin();
  return { user };
});

export const setupAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      await assertMutation();
    } catch {
      return { ok: false as const, error: "forbidden" };
    }
    const sql = await getSql();
    const existing = await sql<{ n: number }>`select count(*) as n from admin_users`;
    if (Number(existing[0]?.n ?? 0) > 0) return { ok: false as const, error: "exists" };
    const name = clip(data.name, 80);
    const email = clip(data.email, 120).toLowerCase();
    const password = String(data.password ?? "");
    if (name.length < 2) return { ok: false as const, error: "name" };
    if (!isEmail(email)) return { ok: false as const, error: "email" };
    if (password.length < 10 || password.length > 72) return { ok: false as const, error: "password" };
    const { randomBytes } = await import("node:crypto");
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = randomBytes(10);
    let recovery = "";
    for (let i = 0; i < 10; i += 1) recovery += alphabet[bytes[i]! % alphabet.length];
    const pretty = `${recovery.slice(0, 4)}-${recovery.slice(4, 8)}-${recovery.slice(8)}`;
    await sql`insert into admin_users (id, email, name, password_hash, recovery_hash)
      values ('owner', ${email}, ${name}, ${await hashSecret(password)}, ${await hashSecret(recovery)})`;
    await setSessionCookie("owner");
    return { ok: true as const, recoveryCode: pretty };
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      await assertMutation();
    } catch {
      return { ok: false as const, error: "forbidden" };
    }
    const email = clip(data.email, 120).toLowerCase();
    const password = String(data.password ?? "");
    const hash = await ipHash();
    const sql = await getSql();
    await sql`delete from login_attempts where created_at < now() - interval '2 days'`;
    const fails = await sql<{ n: number }>`select count(*) as n from login_attempts
      where ip_hash = ${hash} and success = false and created_at > now() - interval '15 minutes'`;
    if (Number(fails[0]?.n ?? 0) >= 8) return { ok: false as const, error: "rate" };
    const users = await sql<{ id: string; password_hash: string }>`select id, password_hash from admin_users where email = ${email} limit 1`;
    const valid = users[0] ? await checkSecret(password, users[0].password_hash) : await checkSecret(password, "scrypt$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    await sql`insert into login_attempts (ip_hash, success) values (${hash}, ${Boolean(users[0] && valid)})`;
    if (!users[0] || !valid) return { ok: false as const, error: "invalid" };
    await setSessionCookie(users[0].id);
    return { ok: true as const };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { getCookie, deleteCookie } = await import("@tanstack/react-start/server");
  const { createHash } = await import("node:crypto");
  const token = getCookie(COOKIE);
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const sql = await getSql();
    await sql`delete from admin_sessions where token_hash = ${tokenHash}`;
  }
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true as const };
});

export const recoverAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      await assertMutation();
    } catch {
      return { ok: false as const, error: "forbidden" };
    }
    const email = clip(data.email, 120).toLowerCase();
    const code = clip(data.code, 40).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const password = String(data.password ?? "");
    if (password.length < 10 || password.length > 72) return { ok: false as const, error: "password" };
    const hash = await ipHash();
    const sql = await getSql();
    const fails = await sql<{ n: number }>`select count(*) as n from login_attempts
      where ip_hash = ${hash} and success = false and created_at > now() - interval '15 minutes'`;
    if (Number(fails[0]?.n ?? 0) >= 8) return { ok: false as const, error: "rate" };
    const users = await sql<{ id: string; recovery_hash: string }>`select id, recovery_hash from admin_users where email = ${email} limit 1`;
    const valid = users[0]?.recovery_hash ? await checkSecret(code, users[0].recovery_hash) : false;
    await sql`insert into login_attempts (ip_hash, success) values (${hash}, ${valid})`;
    if (!valid || !users[0]) return { ok: false as const, error: "invalid" };
    await sql`update admin_users set password_hash = ${await hashSecret(password)} where id = ${users[0].id}`;
    await sql`delete from admin_sessions where admin_id = ${users[0].id}`;
    await setSessionCookie(users[0].id);
    return { ok: true as const };
  });

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const current = String(data.current ?? "");
    const password = String(data.password ?? "");
    if (password.length < 10 || password.length > 72) return { ok: false as const, error: "password" };
    const sql = await getSql();
    const rows = await sql<{ password_hash: string }>`select password_hash from admin_users where id = ${admin.id}`;
    if (!rows[0] || !(await checkSecret(current, rows[0].password_hash))) return { ok: false as const, error: "invalid" };
    await sql`update admin_users set password_hash = ${await hashSecret(password)} where id = ${admin.id}`;
    return { ok: true as const };
  });

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const [counts, recent, followups, content] = await Promise.all([
    sql<{ new_leads: number; total: number }>`select
      count(*) filter (where status = 'new') as new_leads,
      count(*) as total
      from leads`,
    sql<{ id: string; full_name: string; mobile: string; interest: string; status: string; created_at: string }>`select id, full_name, mobile, interest, status, created_at::text as created_at
      from leads order by created_at desc limit 6`,
    sql<{ id: string; full_name: string; next_followup_on: string; status: string }>`select id, full_name, next_followup_on, status
      from leads where next_followup_on <> '' and status not in ('converted', 'not_interested')
      order by next_followup_on limit 8`,
    sql<{ programs: number; articles: number }>`select
      (select count(*) from programs where published = true) as programs,
      (select count(*) from articles where status = 'published') as articles`,
  ]);
  const today = await sql<{ today: string }>`select to_char(now() at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as today`;
  return {
    ok: true as const,
    newLeads: Number(counts[0]?.new_leads ?? 0),
    totalLeads: Number(counts[0]?.total ?? 0),
    programs: Number(content[0]?.programs ?? 0),
    articles: Number(content[0]?.articles ?? 0),
    recent,
    followups,
    today: today[0]?.today ?? "",
  };
});

export const listLeads = createServerFn({ method: "GET" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "unauthorized" };
    const status = clip(data.status, 40);
    const interest = clip(data.interest, 20);
    const q = clip(data.q, 80);
    const from = clip(data.from, 10);
    const to = clip(data.to, 10);
    const offset = Math.max(0, Math.min(5000, Number(data.offset) || 0));
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const sql = await getSql();
    const allowedStatus = ["new", "contacted", "interested", "converted", "not_interested"];
    const rows = await sql.query<{
      id: string;
      full_name: string;
      mobile: string;
      email: string;
      city: string;
      interest: string;
      status: string;
      created_at: string;
      next_followup_on: string;
    }>(
      `select id, full_name, mobile, email, city, interest, status, created_at::text as created_at, next_followup_on
       from leads
       where ($1 = '' or status = $1)
         and ($2 = '' or interest = $2)
         and ($3 = '' or full_name ilike $4 or mobile ilike $4 or email ilike $4 or city ilike $4)
         and ($5 = '' or created_at::date >= $5::date)
         and ($6 = '' or created_at::date <= $6::date)
       order by created_at desc
       limit 20 offset $7`,
      [
        allowedStatus.includes(status) ? status : "",
        interest === "skill" || interest === "business" ? interest : "",
        q,
        like,
        /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : "",
        /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : "",
        offset,
      ],
    );
    return { ok: true as const, leads: rows };
  });

export const getLead = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: clip(data?.id, 80) }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "unauthorized" };
    const sql = await getSql();
    const leads = await sql.query<Record<string, string>>(
      `select id, full_name, mobile, email, city, interest, message, source, landing_page,
              utm_source, utm_medium, utm_campaign, status, next_followup_on, created_at::text as created_at
       from leads where id = $1`,
      [data.id],
    );
    if (!leads[0]) return { ok: false as const, error: "missing" };
    const notes = await sql<{ id: string; body: string; created_at: string }>`select id, body, created_at::text as created_at from lead_notes where lead_id = ${data.id} order by created_at desc`;
    const followups = await sql<{ id: string; note: string; due_on: string; completed_at: string }>`select id, note, due_on, coalesce(completed_at::text, '') as completed_at
      from lead_followups where lead_id = ${data.id} order by created_at desc`;
    return { ok: true as const, lead: leads[0], notes, followups };
  });

export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const id = clip(data.id, 80);
    const status = clip(data.status, 40);
    const allowed = ["new", "contacted", "interested", "converted", "not_interested"];
    if (!allowed.includes(status)) return { ok: false as const, error: "status" };
    const interest = data.interest === "business" ? "business" : "skill";
    const follow = /^\d{4}-\d{2}-\d{2}$/.test(clip(data.next_followup_on, 10)) ? clip(data.next_followup_on, 10) : "";
    const sql = await getSql();
    await sql`update leads set
      full_name = ${clip(data.full_name, 80)},
      mobile = ${clip(data.mobile, 20)},
      email = ${clip(data.email, 120)},
      city = ${clip(data.city, 80)},
      interest = ${interest},
      message = ${clip(data.message, 1000)},
      status = ${status},
      next_followup_on = ${follow},
      updated_at = now()
      where id = ${id}`;
    return { ok: true as const };
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const body = clip(data.body, 2000);
    if (body.length < 1) return { ok: false as const, error: "empty" };
    const { randomUUID } = await import("node:crypto");
    const sql = await getSql();
    await sql`insert into lead_notes (id, lead_id, body) values (${randomUUID()}, ${clip(data.id, 80)}, ${body})`;
    return { ok: true as const };
  });

export const addFollowup = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const due = clip(data.due_on, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return { ok: false as const, error: "date" };
    const id = clip(data.id, 80);
    const { randomUUID } = await import("node:crypto");
    const sql = await getSql();
    await sql`insert into lead_followups (id, lead_id, note, due_on) values (${randomUUID()}, ${id}, ${clip(data.note, 1000)}, ${due})`;
    await sql`update leads set next_followup_on = ${due}, updated_at = now() where id = ${id}`;
    return { ok: true as const };
  });

export const completeFollowup = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const sql = await getSql();
    const id = clip(data.followupId, 80);
    const rows = await sql<{ lead_id: string }>`update lead_followups set completed_at = now() where id = ${id} returning lead_id`;
    if (rows[0]) {
      await sql`update leads set next_followup_on = '' where id = ${rows[0].lead_id} and next_followup_on <> ''`;
    }
    return { ok: true as const };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const sql = await getSql();
    await sql`delete from leads where id = ${clip(data.id, 80)}`;
    return { ok: true as const };
  });

export const exportLeads = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const rows = await sql<Record<string, string>>`select full_name, mobile, email, city, interest, message, status, source, landing_page, utm_source, created_at::text as created_at
    from leads order by created_at desc`;
  const headers = ["full_name", "mobile", "email", "city", "interest", "message", "status", "source", "landing_page", "utm_source", "created_at"];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  return { ok: true as const, csv };
});

const programCols = `id, slug, kind, title_en, title_hi, summary_en, summary_hi, description_en, description_hi,
  benefits_en, benefits_hi, eligibility_en, eligibility_hi, duration_en, duration_hi, format_en, format_hi,
  conditions_en, conditions_hi, show_price, original_price, offer_price, offer_label, offer_expires,
  cta_en, cta_hi, image_media_id, published, sort_order`;

export const adminPrograms = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const programs = await sql.query<Program>(`select ${programCols} from programs order by sort_order, title_en`);
  const faqs = await sql<Faq & { program_id: string }>`select id, program_id, question_en, question_hi, answer_en, answer_hi, sort_order from program_faqs order by sort_order`;
  return { ok: true as const, programs, faqs };
});

export const saveProgram = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const kind = data.kind === "business" || data.kind === "package" ? data.kind : "skill";
    const title = clip(data.title_en, 140);
    if (title.length < 2) return { ok: false as const, error: "title" };
    let slug = slugify(clip(data.slug, 80) || title);
    const id = clip(data.id, 80);
    const sql = await getSql();
    const clash = await sql<{ id: string }>`select id from programs where slug = ${slug} and id <> ${id} limit 1`;
    if (clash[0]) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const showPrice = data.show_price === true;
    const published = data.published === true;
    const sort = Number(data.sort_order) || 0;
    const values = {
      title_hi: clip(data.title_hi, 140),
      summary_en: clip(data.summary_en, 500),
      summary_hi: clip(data.summary_hi, 500),
      description_en: clip(data.description_en, 4000),
      description_hi: clip(data.description_hi, 4000),
      benefits_en: clip(data.benefits_en, 2000),
      benefits_hi: clip(data.benefits_hi, 2000),
      eligibility_en: clip(data.eligibility_en, 500),
      eligibility_hi: clip(data.eligibility_hi, 500),
      duration_en: clip(data.duration_en, 120),
      duration_hi: clip(data.duration_hi, 120),
      format_en: clip(data.format_en, 120),
      format_hi: clip(data.format_hi, 120),
      conditions_en: clip(data.conditions_en, 1000),
      conditions_hi: clip(data.conditions_hi, 1000),
      original_price: showPrice ? clip(data.original_price, 40) : "",
      offer_price: showPrice ? clip(data.offer_price, 40) : "",
      offer_label: clip(data.offer_label, 80),
      offer_expires: /^\d{4}-\d{2}-\d{2}$/.test(clip(data.offer_expires, 10)) ? clip(data.offer_expires, 10) : "",
      cta_en: clip(data.cta_en, 80),
      cta_hi: clip(data.cta_hi, 80),
      image_media_id: clip(data.image_media_id, 80),
    };
    let programId = id;
    if (id) {
      await sql`update programs set
        slug = ${slug}, kind = ${kind}, title_en = ${title}, title_hi = ${values.title_hi},
        summary_en = ${values.summary_en}, summary_hi = ${values.summary_hi},
        description_en = ${values.description_en}, description_hi = ${values.description_hi},
        benefits_en = ${values.benefits_en}, benefits_hi = ${values.benefits_hi},
        eligibility_en = ${values.eligibility_en}, eligibility_hi = ${values.eligibility_hi},
        duration_en = ${values.duration_en}, duration_hi = ${values.duration_hi},
        format_en = ${values.format_en}, format_hi = ${values.format_hi},
        conditions_en = ${values.conditions_en}, conditions_hi = ${values.conditions_hi},
        show_price = ${showPrice}, original_price = ${values.original_price}, offer_price = ${values.offer_price},
        offer_label = ${values.offer_label}, offer_expires = ${values.offer_expires},
        cta_en = ${values.cta_en}, cta_hi = ${values.cta_hi}, image_media_id = ${values.image_media_id},
        published = ${published}, sort_order = ${sort}, updated_at = now()
        where id = ${id}`;
    } else {
      const { randomUUID } = await import("node:crypto");
      programId = randomUUID();
      await sql`insert into programs (
        id, slug, kind, title_en, title_hi, summary_en, summary_hi, description_en, description_hi,
        benefits_en, benefits_hi, eligibility_en, eligibility_hi, duration_en, duration_hi, format_en, format_hi,
        conditions_en, conditions_hi, show_price, original_price, offer_price, offer_label, offer_expires,
        cta_en, cta_hi, image_media_id, published, sort_order
      ) values (
        ${programId}, ${slug}, ${kind}, ${title}, ${values.title_hi}, ${values.summary_en}, ${values.summary_hi},
        ${values.description_en}, ${values.description_hi}, ${values.benefits_en}, ${values.benefits_hi},
        ${values.eligibility_en}, ${values.eligibility_hi}, ${values.duration_en}, ${values.duration_hi},
        ${values.format_en}, ${values.format_hi}, ${values.conditions_en}, ${values.conditions_hi},
        ${showPrice}, ${values.original_price}, ${values.offer_price}, ${values.offer_label}, ${values.offer_expires},
        ${values.cta_en}, ${values.cta_hi}, ${values.image_media_id}, ${published}, ${sort}
      )`;
    }
    await sql`delete from program_faqs where program_id = ${programId}`;
    const faqs = Array.isArray(data.faqs) ? data.faqs.slice(0, 12) : [];
    const { randomUUID } = await import("node:crypto");
    for (let i = 0; i < faqs.length; i += 1) {
      const faq = faqs[i] as Record<string, unknown>;
      const question = clip(faq.question_en, 300);
      const answer = clip(faq.answer_en, 1000);
      if (!question || !answer) continue;
      await sql`insert into program_faqs (id, program_id, question_en, question_hi, answer_en, answer_hi, sort_order)
        values (${randomUUID()}, ${programId}, ${question}, ${clip(faq.question_hi, 300)}, ${answer}, ${clip(faq.answer_hi, 1000)}, ${i})`;
    }
    return { ok: true as const };
  });

export const deleteProgram = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const sql = await getSql();
    await sql`delete from programs where id = ${clip(data.id, 80)}`;
    return { ok: true as const };
  });

export const adminPartner = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const rows = await sql<Partner>`select enabled, name, website_url, description_en, description_hi, logo_media_id, disclosure_en, disclosure_hi from partner_settings where id = 1`;
  return { ok: true as const, partner: rows[0] };
});

export const savePartner = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const sql = await getSql();
    await sql`update partner_settings set
      enabled = ${data.enabled === true},
      name = ${clip(data.name, 160)},
      website_url = ${clip(data.website_url, 300)},
      description_en = ${clip(data.description_en, 2000)},
      description_hi = ${clip(data.description_hi, 2000)},
      logo_media_id = ${clip(data.logo_media_id, 80)},
      disclosure_en = ${clip(data.disclosure_en, 1000)},
      disclosure_hi = ${clip(data.disclosure_hi, 1000)}
      where id = 1`;
    return { ok: true as const };
  });

export const adminArticles = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const articles = await sql<AdminArticle>`select id, slug, title_en, title_hi, excerpt_en, excerpt_hi, body_en, body_hi, category_id,
    featured_media_id, youtube_id, resource_media_id, resource_label_en, resource_label_hi,
    seo_title_en, seo_title_hi, seo_description_en, seo_description_hi, status,
    coalesce(to_char(published_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'), '') as publish_on
    from articles order by updated_at desc`;
  const categories = await sql<Category>`select id, slug, name_en, name_hi from article_categories order by sort_order`;
  const tags = await sql<{ article_id: string; name_en: string }>`select l.article_id, t.name_en from article_tag_links l join article_tags t on t.id = l.tag_id`;
  return { ok: true as const, articles, categories, tags };
});

export const saveArticle = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const title = clip(data.title_en, 180);
    if (title.length < 2) return { ok: false as const, error: "title" };
    const sql = await getSql();
    let categoryId = clip(data.category_id, 80);
    const newCategory = clip(data.new_category, 80);
    if (newCategory) {
      const { randomUUID } = await import("node:crypto");
      categoryId = randomUUID();
      await sql`insert into article_categories (id, slug, name_en, name_hi, sort_order)
        values (${categoryId}, ${slugify(newCategory)}, ${newCategory}, ${clip(data.new_category_hi, 80)}, 20)`;
    }
    if (!categoryId) return { ok: false as const, error: "category" };
    let slug = slugify(clip(data.slug, 80) || title);
    const id = clip(data.id, 80);
    const clash = await sql<{ id: string }>`select id from articles where slug = ${slug} and id <> ${id} limit 1`;
    if (clash[0]) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const status = data.status === "published" ? "published" : "draft";
    const publishOn = clip(data.publish_on, 10);
    const when = /^\d{4}-\d{2}-\d{2}$/.test(publishOn) ? `${publishOn}T00:00:00+05:30` : null;
    const fields = {
      title_hi: clip(data.title_hi, 180),
      excerpt_en: clip(data.excerpt_en, 400),
      excerpt_hi: clip(data.excerpt_hi, 400),
      body_en: clip(data.body_en, 20000),
      body_hi: clip(data.body_hi, 20000),
      featured_media_id: clip(data.featured_media_id, 80),
      youtube_id: youtubeId(clip(data.youtube_id, 200)),
      resource_media_id: clip(data.resource_media_id, 80),
      resource_label_en: clip(data.resource_label_en, 120),
      resource_label_hi: clip(data.resource_label_hi, 120),
      seo_title_en: clip(data.seo_title_en, 180),
      seo_title_hi: clip(data.seo_title_hi, 180),
      seo_description_en: clip(data.seo_description_en, 300),
      seo_description_hi: clip(data.seo_description_hi, 300),
    };
    let articleId = id;
    if (id) {
      await sql.query(
        `update articles set slug = $1, title_en = $2, title_hi = $3, excerpt_en = $4, excerpt_hi = $5,
          body_en = $6, body_hi = $7, category_id = $8, featured_media_id = $9, youtube_id = $10,
          resource_media_id = $11, resource_label_en = $12, resource_label_hi = $13,
          seo_title_en = $14, seo_title_hi = $15, seo_description_en = $16, seo_description_hi = $17,
          status = $18, published_at = case when $18 = 'published' then coalesce($19::timestamptz, published_at, now()) else null end,
          updated_at = now()
         where id = $20`,
        [slug, title, fields.title_hi, fields.excerpt_en, fields.excerpt_hi, fields.body_en, fields.body_hi, categoryId, fields.featured_media_id, fields.youtube_id, fields.resource_media_id, fields.resource_label_en, fields.resource_label_hi, fields.seo_title_en, fields.seo_title_hi, fields.seo_description_en, fields.seo_description_hi, status, when, id],
      );
    } else {
      const { randomUUID } = await import("node:crypto");
      articleId = randomUUID();
      await sql.query(
        `insert into articles (
          id, slug, title_en, title_hi, excerpt_en, excerpt_hi, body_en, body_hi, category_id, featured_media_id,
          youtube_id, resource_media_id, resource_label_en, resource_label_hi, seo_title_en, seo_title_hi,
          seo_description_en, seo_description_hi, status, published_at
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
          case when $19 = 'published' then coalesce($20::timestamptz, now()) else null end
        )`,
        [articleId, slug, title, fields.title_hi, fields.excerpt_en, fields.excerpt_hi, fields.body_en, fields.body_hi, categoryId, fields.featured_media_id, fields.youtube_id, fields.resource_media_id, fields.resource_label_en, fields.resource_label_hi, fields.seo_title_en, fields.seo_title_hi, fields.seo_description_en, fields.seo_description_hi, status, when],
      );
    }
    await sql`delete from article_tag_links where article_id = ${articleId}`;
    const names = clip(data.tags, 300).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8);
    const { randomUUID } = await import("node:crypto");
    for (const name of names) {
      const tagSlug = slugify(name);
      const found = await sql<{ id: string }>`select id from article_tags where slug = ${tagSlug} limit 1`;
      let tagId = found[0]?.id;
      if (!tagId) {
        tagId = randomUUID();
        await sql`insert into article_tags (id, slug, name_en, name_hi) values (${tagId}, ${tagSlug}, ${name.slice(0, 40)}, ${name.slice(0, 40)})`;
      }
      await sql`insert into article_tag_links (article_id, tag_id) values (${articleId}, ${tagId}) on conflict do nothing`;
    }
    return { ok: true as const };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const sql = await getSql();
    await sql`delete from articles where id = ${clip(data.id, 80)}`;
    return { ok: true as const };
  });

async function simpleList<Row>(table: string, columns: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const rows = await sql.query<Row>(`select ${columns} from ${table} order by created_at desc`);
  return { ok: true as const, rows };
}

export const adminTestimonials = createServerFn({ method: "GET" }).handler(async () =>
  simpleList<Testimonial>("testimonials", "id, name, content_en, content_hi, date_label, image_media_id, approved, featured"),
);
export const adminAchievements = createServerFn({ method: "GET" }).handler(async () =>
  simpleList<Achievement>("achievements", "id, title, description, date_label, category, image_media_id, visible"),
);
export const adminCertifications = createServerFn({ method: "GET" }).handler(async () =>
  simpleList<Certification>("certifications", "id, name, issuer, date_label, credential_url, image_media_id, visible"),
);
export const adminMilestones = createServerFn({ method: "GET" }).handler(async () =>
  simpleList<Milestone>("journey_milestones", "id, title_en, title_hi, body_en, body_hi, date_label, image_media_id, sort_order, visible"),
);

export const saveTestimonial = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => saveRow("testimonials", data, ["name", "content_en", "content_hi", "date_label", "image_media_id"], ["approved", "featured"]));

export const saveAchievement = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => saveRow("achievements", data, ["title", "description", "date_label", "category", "image_media_id"], ["visible"]));

export const saveCertification = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => saveRow("certifications", data, ["name", "issuer", "date_label", "credential_url", "image_media_id"], ["visible"]));

export const saveMilestone = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => saveRow("journey_milestones", data, ["title_en", "title_hi", "body_en", "body_hi", "date_label", "image_media_id", "sort_order"], ["visible"]));

async function saveRow(table: string, data: Record<string, unknown>, texts: string[], flags: string[]) {
  const admin = await guard();
  if (failed(admin)) return admin;
  const allowed = new Set(["testimonials", "achievements", "certifications", "journey_milestones"]);
  if (!allowed.has(table)) return { ok: false as const, error: "table" };
  const sql = await getSql();
  const id = clip(data.id, 80);
  const textValues = texts.map((key) => (key === "sort_order" ? Number(data.sort_order) || 0 : clip(data[key], key.startsWith("body") || key.startsWith("content") || key === "description" ? 4000 : 300)));
  const primary = texts[0] === "sort_order" ? "ok" : String(textValues[0] ?? "");
  if (primary.length < 2) return { ok: false as const, error: "title" };
  const flagValues = flags.map((key) => data[key] === true);
  if (id) {
    const sets = [...texts.map((key, i) => `${key} = $${i + 1}`), ...flags.map((key, i) => `${key} = $${texts.length + i + 1}`)].join(", ");
    await sql.query(`update ${table} set ${sets} where id = $${texts.length + flags.length + 1}`, [...textValues, ...flagValues, id]);
  } else {
    const { randomUUID } = await import("node:crypto");
    const newId = randomUUID();
    const cols = ["id", ...texts, ...flags].join(", ");
    const slots = ["id", ...texts, ...flags].map((_, i) => `$${i + 1}`).join(", ");
    await sql.query(`insert into ${table} (${cols}) values (${slots})`, [newId, ...textValues, ...flagValues]);
  }
  return { ok: true as const };
}

export const deleteRow = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const table = clip(data.table, 40);
    const allowed = new Set(["testimonials", "achievements", "certifications", "journey_milestones"]);
    if (!allowed.has(table)) return { ok: false as const, error: "table" };
    const sql = await getSql();
    await sql.query(`delete from ${table} where id = $1`, [clip(data.id, 80)]);
    return { ok: true as const };
  });

const settingKeys = [
  "brand_name", "person_name", "tagline_en", "tagline_hi", "welcome_en", "welcome_hi",
  "hero_intro_en", "hero_intro_hi", "role_en", "role_hi", "about_heading_en", "about_heading_hi",
  "about_body_en", "about_body_hi", "journey_heading_en", "journey_heading_hi", "journey_body_en",
  "journey_body_hi", "journey_quote_en", "journey_quote_hi", "phone_display", "whatsapp_e164", "email",
  "instagram_url", "facebook_url", "portrait_media_id", "journey_media_id", "contact_media_id",
  "footer_blurb_en", "footer_blurb_hi", "seo_title_en", "seo_title_hi", "seo_description_en",
  "seo_description_hi", "wa_skill_en", "wa_skill_hi", "wa_business_en", "wa_business_hi",
  "wa_general_en", "wa_general_hi", "education_label_en", "education_caption_en", "education_label_hi",
  "education_caption_hi", "experience_label_en", "experience_caption_en", "experience_label_hi",
  "experience_caption_hi", "site_url",
] as const;

export const adminSettings = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const rows = await sql.query<Settings>(`select ${settingKeys.join(", ")} from website_settings where id = 1`);
  return { ok: true as const, settings: rows[0] };
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const long = new Set(["about_body_en", "about_body_hi", "journey_body_en", "journey_body_hi", "hero_intro_en", "hero_intro_hi", "footer_blurb_en", "footer_blurb_hi", "wa_skill_en", "wa_skill_hi", "wa_business_en", "wa_business_hi", "wa_general_en", "wa_general_hi", "seo_description_en", "seo_description_hi"]);
    const values = settingKeys.map((key) => clip(data[key], long.has(key) ? 4000 : 300));
    const sets = settingKeys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const sql = await getSql();
    await sql.query(`update website_settings set ${sets} where id = 1`, values);
    return { ok: true as const };
  });

export const adminMedia = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "unauthorized" };
  const sql = await getSql();
  const rows = await sql<{ id: string; filename: string; mime: string; alt: string; created_at: string }>`select id, filename, mime, alt, created_at::text as created_at
    from media_assets order by created_at desc limit 40`;
  return { ok: true as const, media: rows };
});

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const mime = clip(data.mime, 40);
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return { ok: false as const, error: "mime" };
    const raw = String(data.data_base64 ?? "");
    if (raw.length < 32 || raw.length > 1_800_000) return { ok: false as const, error: "size" };
    if (!/^[A-Za-z0-9+/=\s]+$/.test(raw)) return { ok: false as const, error: "file" };
    const { randomUUID } = await import("node:crypto");
    const id = randomUUID();
    const filename = clip(data.filename, 80).replace(/[^\w.-]+/g, "") || "image";
    const sql = await getSql();
    await sql`insert into media_assets (id, filename, mime, data_base64, alt) values (${id}, ${filename}, ${mime}, ${raw}, ${clip(data.alt, 160)})`;
    return { ok: true as const, id };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const admin = await guard();
    if (failed(admin)) return admin;
    const id = clip(data.id, 80);
    const sql = await getSql();
    await sql`delete from media_assets where id = ${id}`;
    await sql`update website_settings set
      portrait_media_id = case when portrait_media_id = ${id} then '' else portrait_media_id end,
      journey_media_id = case when journey_media_id = ${id} then '' else journey_media_id end,
      contact_media_id = case when contact_media_id = ${id} then '' else contact_media_id end
      where id = 1`;
    await sql`update programs set image_media_id = '' where image_media_id = ${id}`;
    await sql`update articles set featured_media_id = '' where featured_media_id = ${id}`;
    return { ok: true as const };
  });

export const adminAnalytics = createServerFn({ method: "GET" })
  .inputValidator((data: { days?: number }) => ({ days: Number(data?.days) || 30 }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "unauthorized" };
    const window = data.days === 7 ? "7 days" : data.days === 90 ? "90 days" : "30 days";
    const sql = await getSql();
    const totals = await sql.query<{ sessions: number; page_views: number; whatsapp: number; starts: number; submits: number; program_views: number }>(
      `select
        count(distinct session_id) filter (where event_name = 'page_view') as sessions,
        count(*) filter (where event_name = 'page_view') as page_views,
        count(*) filter (where event_name = 'whatsapp_click') as whatsapp,
        count(*) filter (where event_name = 'enquiry_start') as starts,
        count(*) filter (where event_name = 'enquiry_submit') as submits,
        count(*) filter (where event_name = 'program_view') as program_views
       from analytics_events
       where created_at > now() - interval '${window}'`,
    );
    const sources = await sql.query<{ source: string; n: number }>(
      `select case
          when utm_source <> '' then utm_source
          when referrer_host ilike '%instagram%' then 'Instagram'
          when referrer_host ilike '%facebook%' or referrer_host ilike '%fb.%' then 'Facebook'
          when referrer_host ilike '%google%' then 'Google'
          when referrer_host = '' then 'Direct'
          else referrer_host
        end as source,
        count(*) as n
       from analytics_events
       where event_name = 'page_view' and created_at > now() - interval '${window}'
       group by 1 order by n desc limit 8`,
    );
    const devices = await sql.query<{ device: string; n: number }>(
      `select device, count(distinct session_id) as n from analytics_events
       where event_name = 'page_view' and created_at > now() - interval '${window}'
       group by device`,
    );
    const pages = await sql.query<{ path: string; n: number }>(
      `select path, count(*) as n from analytics_events
       where event_name = 'page_view' and created_at > now() - interval '${window}'
       group by path order by n desc limit 8`,
    );
    const daily = await sql.query<{ day: string; views: number; enquiries: number }>(
      `select to_char(created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as day,
        count(*) filter (where event_name = 'page_view') as views,
        count(*) filter (where event_name = 'enquiry_submit') as enquiries
       from analytics_events
       where created_at > now() - interval '${window}'
       group by 1 order by 1`,
    );
    const sessions = Number(totals[0]?.sessions ?? 0);
    const submits = Number(totals[0]?.submits ?? 0);
    return {
      ok: true as const,
      sessions,
      pageViews: Number(totals[0]?.page_views ?? 0),
      whatsapp: Number(totals[0]?.whatsapp ?? 0),
      starts: Number(totals[0]?.starts ?? 0),
      submits,
      programViews: Number(totals[0]?.program_views ?? 0),
      conversion: sessions > 0 ? submits / sessions : null,
      sources: sources.map((row) => ({ source: row.source, n: Number(row.n) })),
      devices: devices.map((row) => ({ device: row.device || "unknown", n: Number(row.n) })),
      pages: pages.map((row) => ({ path: row.path || "/", n: Number(row.n) })),
      daily: daily.map((row) => ({ day: row.day, views: Number(row.views), enquiries: Number(row.enquiries) })),
    };
  });
