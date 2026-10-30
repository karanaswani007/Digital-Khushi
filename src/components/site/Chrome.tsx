import { useEffect, useState } from "react";
import { Link, getRouteApi, useRouterState } from "@tanstack/react-router";
import { Menu, X, Instagram, Facebook, Mail, ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { waUrl } from "@/lib/utils";
import { LogoMark, WhatsAppIcon, Wordmark } from "@/components/site/Logo";
import { PageViews, track } from "@/components/site/analytics";

const root = getRouteApi("__root__");

const links = [
  { id: "home", href: "/", key: "home" as const, route: true },
  { id: "about", href: "/#about", key: "about" as const },
  { id: "programs", href: "/programs", key: "programs" as const, route: true },
  { id: "partner", href: "/partner", key: "partner" as const, route: true },
  { id: "knowledge", href: "/knowledge", key: "knowledge" as const, route: true },
  { id: "contact", href: "/#contact", key: "contact" as const },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const admin = path.startsWith("/admin");
  if (admin) return <>{children}</>;
  return (
    <>
      <PageViews />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      {children}
      <Footer />
      <WhatsAppFloat />
      <ConsentBanner />
    </>
  );
}

function Header() {
  const { settings } = root.useLoaderData();
  const { t, lang, setLang, pick } = useI18n();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("home");

  useEffect(() => {
    if (path !== "/") return;
    const nodes = ["about", "programs", "contact"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.1, 0.4] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [path]);

  useEffect(() => {
    document.title = pick(settings.seo_title_en, settings.seo_title_hi);
  }, [lang, pick, settings.seo_title_en, settings.seo_title_hi, path]);

  const active = path.startsWith("/programs")
    ? "programs"
    : path.startsWith("/partner")
      ? "partner"
      : path.startsWith("/knowledge")
        ? "knowledge"
        : path.startsWith("/about")
          ? "about"
          : path.startsWith("/contact")
            ? "contact"
            : path === "/"
              ? section
              : "";

  const wa = waUrl(settings.whatsapp_e164, pick(settings.wa_general_en, settings.wa_general_hi));

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark tagline={t("logoTag")} />
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={active === item.id ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${active === item.id ? "text-royal" : "text-ink"}`}
            >
              {t(item.key)}
              {active === item.id ? <span className="mx-auto mt-1 block h-0.5 w-5 rounded-full bg-royal" /> : null}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <div className="flex rounded-full bg-soft p-1 text-sm font-bold" role="group" aria-label="Language">
            <button type="button" className={`min-h-9 rounded-full px-3 ${lang === "en" ? "bg-paper text-ink shadow-card" : "text-muted"}`} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
            <button type="button" className={`min-h-9 rounded-full px-3 ${lang === "hi" ? "bg-paper text-ink shadow-card" : "text-muted"}`} onClick={() => setLang("hi")} aria-pressed={lang === "hi"}>हिंदी</button>
          </div>
          <a className="btn btn-primary hidden sm:inline-flex" href={wa} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "header")}>
            <WhatsAppIcon className="size-4" />
            {t("letsConnect")}
          </a>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-soft text-ink lg:hidden" aria-expanded={open} aria-label={open ? t("close") : t("menu")} onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="grid gap-1 border-t border-line px-4 py-3 lg:hidden" aria-label="Mobile">
          {links.map((item) => (
            <a key={item.id} href={item.href} className="rounded-2xl px-3 py-3 text-base font-semibold" onClick={() => setOpen(false)}>
              {t(item.key)}
            </a>
          ))}
          <a className="btn btn-primary mt-2" href={wa} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "menu")}>
            <WhatsAppIcon className="size-4" />
            {t("letsConnect")}
          </a>
        </nav>
      ) : null}
    </header>
  );
}

function Footer() {
  const { settings, partner } = root.useLoaderData();
  const { t, pick } = useI18n();
  const year = new Date().getFullYear();
  const wa = waUrl(settings.whatsapp_e164, pick(settings.wa_general_en, settings.wa_general_hi));
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <Wordmark tagline={t("logoTag")} />
          <p className="mt-4 max-w-sm text-sm text-muted">{pick(settings.footer_blurb_en, settings.footer_blurb_hi)}</p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-muted">{pick(partner.disclosure_en, partner.disclosure_hi)}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold">{t("onThisPage")}</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-muted">
            <a href="/#about">{t("about")}</a>
            <a href="/programs">{t("programs")}</a>
            <a href="/partner">{t("partner")}</a>
            <a href="/knowledge">{t("knowledge")}</a>
            <a href="/#contact">{t("contact")}</a>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold">{settings.person_name}</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold">
            <a className="inline-flex items-center gap-2" href={wa} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "footer")}>
              <WhatsAppIcon className="size-4 text-whatsapp" /> {settings.phone_display}
            </a>
            <a className="inline-flex items-center gap-2" href={`mailto:${settings.email}`}>
              <Mail className="size-4 text-royal" /> {settings.email}
            </a>
            {partner.enabled ? (
              <a href={partner.website_url} target="_blank" rel="noreferrer">{partner.name}</a>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2">
            {settings.instagram_url ? <a className="grid size-11 place-items-center rounded-full bg-soft" href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="size-4" /></a> : null}
            {settings.facebook_url ? <a className="grid size-11 place-items-center rounded-full bg-soft" href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook className="size-4" /></a> : null}
            <a className="grid size-11 place-items-center rounded-full bg-royal text-paper" href="#main" aria-label="Back to top"><ArrowUp className="size-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {year} {settings.brand_name}. {t("rights")}
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  const { settings } = root.useLoaderData();
  const { t, pick } = useI18n();
  return (
    <a
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-paper shadow-lift"
      href={waUrl(settings.whatsapp_e164, pick(settings.wa_general_en, settings.wa_general_hi))}
      target="_blank"
      rel="noreferrer"
      aria-label={t("waFloat")}
      onClick={() => track("whatsapp_click", "float")}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

function ConsentBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("dk-consent");
    if (saved !== "yes" && saved !== "no") setVisible(true);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 max-w-md rounded-3xl bg-deep p-4 text-cream shadow-lift md:left-4">
      <p className="text-sm leading-6">{t("consent")}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-primary" onClick={() => { window.localStorage.setItem("dk-consent", "yes"); setVisible(false); }}>{t("allow")}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { window.localStorage.setItem("dk-consent", "no"); setVisible(false); }}>{t("decline")}</button>
      </div>
    </div>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="prose-dk">
      {blocks.map((block) => {
        const rows = block.split("\n");
        if (rows.every((row) => row.trim().startsWith("- "))) {
          return (
            <ul key={block}>
              {rows.map((row) => <li key={row}>{row.replace(/^- /, "")}</li>)}
            </ul>
          );
        }
        return <p key={block}>{block}</p>;
      })}
    </div>
  );
}

export function CheckList({ text }: { text: string }) {
  const items = text.split("\n").map((item) => item.trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="grid gap-2 text-sm text-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-0.5 text-teal-deep" aria-hidden="true">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export { LogoMark };
