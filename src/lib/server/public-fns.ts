import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type {
  Achievement,
  Article,
  ArticleCard,
  Category,
  Certification,
  Faq,
  HomeContent,
  Milestone,
  Partner,
  Program,
  Settings,
  Shell,
  Testimonial,
} from "@/lib/types";
import { isEmail, normalizeIndianMobile } from "@/lib/utils";

const settingsCols = `brand_name, person_name, tagline_en, tagline_hi, welcome_en, welcome_hi,
  hero_intro_en, hero_intro_hi, role_en, role_hi,
  about_heading_en, about_heading_hi, about_body_en, about_body_hi,
  journey_heading_en, journey_heading_hi, journey_body_en, journey_body_hi,
  journey_quote_en, journey_quote_hi, phone_display, whatsapp_e164, email,
  instagram_url, facebook_url, portrait_media_id, journey_media_id, contact_media_id,
  footer_blurb_en, footer_blurb_hi, seo_title_en, seo_title_hi, seo_description_en, seo_description_hi,
  wa_skill_en, wa_skill_hi, wa_business_en, wa_business_hi, wa_general_en, wa_general_hi,
  education_label_en, education_caption_en, education_label_hi, education_caption_hi,
  experience_label_en, experience_caption_en, experience_label_hi, experience_caption_hi, site_url`;

const programCols = `id, slug, kind, title_en, title_hi, summary_en, summary_hi, description_en, description_hi,
  benefits_en, benefits_hi, eligibility_en, eligibility_hi, duration_en, duration_hi, format_en, format_hi,
  conditions_en, conditions_hi, show_price, original_price, offer_price, offer_label, offer_expires,
  cta_en, cta_hi, image_media_id, published, sort_order`;

async function origin() {
  try {
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const url = getRequestUrl({ xForwardedHost: true, xForwardedProto: true });
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

async function loadSettings() {
  const sql = await getSql();
  const rows = await sql.query<Settings>(`select ${settingsCols} from website_settings where id = 1`);
  if (!rows[0]) throw new Error("Website settings are not ready.");
  return rows[0];
}

async function loadPartner() {
  const sql = await getSql();
  const rows = await sql.query<Partner>(
    `select enabled, name, website_url, description_en, description_hi, logo_media_id, disclosure_en, disclosure_hi
     from partner_settings where id = 1`,
  );
  if (!rows[0]) throw new Error("Partner settings are not ready.");
  return rows[0];
}

export const getShell = createServerFn({ method: "GET" }).handler(async (): Promise<Shell> => {
  const [settings, partner, siteOrigin] = await Promise.all([loadSettings(), loadPartner(), origin()]);
  return { settings, partner, origin: settings.site_url || siteOrigin };
});

export const getHomeContent = createServerFn({ method: "GET" }).handler(async (): Promise<HomeContent> => {
  const sql = await getSql();
  const [programs, articles, testimonials, achievements, certifications, milestones] = await Promise.all([
    sql.query<Program>(
      `select ${programCols} from programs where published = true order by sort_order, title_en`,
    ),
    sql.query<ArticleCard>(
      `select a.id, a.slug, a.title_en, a.title_hi, a.excerpt_en, a.excerpt_hi, a.category_id,
              c.name_en as category_en, c.name_hi as category_hi, a.featured_media_id,
              coalesce(to_char(a.published_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'), '') as published_on
       from articles a
       join article_categories c on c.id = a.category_id
       where a.status = 'published' and (a.published_at is null or a.published_at <= now())
       order by a.published_at desc nulls last
       limit 3`,
    ),
    sql<Testimonial>`select id, name, content_en, content_hi, date_label, image_media_id, approved, featured
      from testimonials where approved = true order by featured desc, created_at desc limit 8`,
    sql<Achievement>`select id, title, description, date_label, category, image_media_id, visible
      from achievements where visible = true order by created_at desc`,
    sql<Certification>`select id, name, issuer, date_label, credential_url, image_media_id, visible
      from certifications where visible = true order by created_at desc`,
    sql<Milestone>`select id, title_en, title_hi, body_en, body_hi, date_label, image_media_id, sort_order, visible
      from journey_milestones where visible = true order by sort_order, created_at`,
  ]);
  return { programs, articles, testimonials, achievements, certifications, milestones };
});

export const getProgram = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data?.slug ?? "").slice(0, 80) }))
  .handler(async ({ data }): Promise<{ program: Program; faqs: Faq[] } | null> => {
    const sql = await getSql();
    const rows = await sql.query<Program>(
      `select ${programCols} from programs where slug = $1 and published = true`,
      [data.slug],
    );
    const program = rows[0];
    if (!program) return null;
    const faqs = await sql<Faq>`select id, question_en, question_hi, answer_en, answer_hi, sort_order
      from program_faqs where program_id = ${program.id} order by sort_order, question_en`;
    return { program, faqs };
  });

export const listPrograms = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql.query<Program>(
    `select ${programCols} from programs where published = true order by sort_order, title_en`,
  );
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<Category>`select id, slug, name_en, name_hi from article_categories order by sort_order, name_en`;
});

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator((data: { q?: string; category?: string }) => ({
    q: String(data?.q ?? "").trim().slice(0, 80),
    category: String(data?.category ?? "").slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const like = `%${data.q.replace(/[%_]/g, "")}%`;
    return sql.query<ArticleCard>(
      `select a.id, a.slug, a.title_en, a.title_hi, a.excerpt_en, a.excerpt_hi, a.category_id,
              c.name_en as category_en, c.name_hi as category_hi, a.featured_media_id,
              coalesce(to_char(a.published_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'), '') as published_on
       from articles a
       join article_categories c on c.id = a.category_id
       where a.status = 'published' and (a.published_at is null or a.published_at <= now())
         and ($1 = '' or a.title_en ilike $2 or a.title_hi ilike $2 or a.excerpt_en ilike $2 or a.excerpt_hi ilike $2)
         and ($3 = '' or c.slug = $3)
       order by a.published_at desc nulls last
       limit 24`,
      [data.q, like, data.category],
    );
  });

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data?.slug ?? "").slice(0, 80) }))
  .handler(async ({ data }): Promise<{ article: Article; related: ArticleCard[] } | null> => {
    const sql = await getSql();
    const rows = await sql.query<Article>(
      `select a.id, a.slug, a.title_en, a.title_hi, a.excerpt_en, a.excerpt_hi, a.body_en, a.body_hi,
              a.category_id, c.name_en as category_en, c.name_hi as category_hi, a.featured_media_id,
              coalesce(to_char(a.published_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'), '') as published_on,
              a.youtube_id, a.resource_media_id, a.resource_label_en, a.resource_label_hi,
              a.seo_title_en, a.seo_title_hi, a.seo_description_en, a.seo_description_hi, a.status,
              coalesce((select string_agg(t.name_en, ', ' order by t.name_en) from article_tag_links l join article_tags t on t.id = l.tag_id where l.article_id = a.id), '') as tags
       from articles a
       join article_categories c on c.id = a.category_id
       where a.slug = $1 and a.status = 'published' and (a.published_at is null or a.published_at <= now())`,
      [data.slug],
    );
    const article = rows[0];
    if (!article) return null;
    const related = await sql.query<ArticleCard>(
      `select a.id, a.slug, a.title_en, a.title_hi, a.excerpt_en, a.excerpt_hi, a.category_id,
              c.name_en as category_en, c.name_hi as category_hi, a.featured_media_id,
              coalesce(to_char(a.published_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'), '') as published_on
       from articles a
       join article_categories c on c.id = a.category_id
       where a.status = 'published' and a.id <> $1 and a.category_id = $2
         and (a.published_at is null or a.published_at <= now())
       order by a.published_at desc nulls last
       limit 3`,
      [article.id, article.category_id],
    );
    return { article, related };
  });

type LeadResult = { ok: true } | { ok: false; error: string };

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }): Promise<LeadResult> => {
    const company = String(data.company ?? "");
    if (company.trim()) return { ok: true };
    const fullName = String(data.fullName ?? "").trim().slice(0, 80);
    const mobile = normalizeIndianMobile(String(data.mobile ?? ""));
    const email = String(data.email ?? "").trim().slice(0, 120);
    const city = String(data.city ?? "").trim().slice(0, 80);
    const interest = data.interest === "business" ? "business" : data.interest === "skill" ? "skill" : "";
    const message = String(data.message ?? "").trim().slice(0, 1000);
    if (fullName.length < 2) return { ok: false, error: "name" };
    if (!mobile) return { ok: false, error: "mobile" };
    if (email && !isEmail(email)) return { ok: false, error: "email" };
    if (!interest) return { ok: false, error: "interest" };

    const { getRequestIP } = await import("@tanstack/react-start/server");
    const { createHash, randomUUID } = await import("node:crypto");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const sql = await getSql();
    const recent = await sql<{ n: number }>`select count(*) as n from leads
      where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
    if (Number(recent[0]?.n ?? 0) >= 5) return { ok: false, error: "rate" };
    const dup = await sql<{ id: string }>`select id from leads
      where mobile = ${mobile} and interest = ${interest} and created_at > now() - interval '30 minutes' limit 1`;
    if (dup[0]) return { ok: true };

    const id = randomUUID();
    const landing = String(data.landingPage ?? "").slice(0, 300);
    const referrer = String(data.referrerHost ?? "").slice(0, 120);
    const utmSource = String(data.utmSource ?? "").slice(0, 80);
    const utmMedium = String(data.utmMedium ?? "").slice(0, 80);
    const utmCampaign = String(data.utmCampaign ?? "").slice(0, 80);
    await sql`insert into leads (
      id, full_name, mobile, email, city, interest, message, source, landing_page,
      utm_source, utm_medium, utm_campaign, ip_hash
    ) values (
      ${id}, ${fullName}, ${mobile}, ${email}, ${city}, ${interest}, ${message}, ${referrer}, ${landing},
      ${utmSource}, ${utmMedium}, ${utmCampaign}, ${ipHash}
    )`;
    return { ok: true };
  });

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const allowed = new Set(["page_view", "program_view", "whatsapp_click", "enquiry_start", "enquiry_submit"]);
    const event = String(data.event ?? "");
    if (!allowed.has(event)) return { ok: true };
    const sessionId = String(data.sessionId ?? "").slice(0, 80);
    if (!/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) return { ok: true };
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const { createHash } = await import("node:crypto");
    const ipHash = createHash("sha256")
      .update(getRequestIP({ xForwardedFor: true }) ?? "unknown")
      .digest("hex");
    const sql = await getSql();
    const recent = await sql<{ n: number }>`select count(*) as n from analytics_events
      where ip_hash = ${ipHash} and created_at > now() - interval '10 minutes'`;
    if (Number(recent[0]?.n ?? 0) > 80) return { ok: true };
    await sql`insert into analytics_events (
      session_id, event_name, path, referrer_host, utm_source, utm_medium, utm_campaign, device, meta, ip_hash
    ) values (
      ${sessionId}, ${event}, ${String(data.path ?? "").slice(0, 200)},
      ${String(data.referrerHost ?? "").slice(0, 120)},
      ${String(data.utmSource ?? "").slice(0, 80)},
      ${String(data.utmMedium ?? "").slice(0, 80)},
      ${String(data.utmCampaign ?? "").slice(0, 80)},
      ${data.device === "mobile" ? "mobile" : "desktop"},
      ${String(data.meta ?? "").slice(0, 120)},
      ${ipHash}
    )`;
    return { ok: true };
  });

export const publicSitemap = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [programs, articles, siteOrigin] = await Promise.all([
    sql<{ slug: string }>`select slug from programs where published = true`,
    sql<{ slug: string }>`select slug from articles where status = 'published' and (published_at is null or published_at <= now())`,
    origin(),
  ]);
  const settings = await loadSettings();
  return {
    origin: settings.site_url || siteOrigin,
    programs: programs.map((row) => row.slug),
    articles: articles.map((row) => row.slug),
  };
});
