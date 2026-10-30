import { Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, LineChart, MessagesSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ArticleCard, HomeContent, Program, Settings } from "@/lib/types";
import { lines, todayISO, waUrl } from "@/lib/utils";
import { track } from "@/components/site/analytics";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { CheckList, LogoMark } from "@/components/site/Chrome";
import { WhatsAppIcon } from "@/components/site/Logo";

const root = getRouteApi("__root__");

const fallbackArticle = ["/images/article-marketing.jpg", "/images/article-home2.jpg", "/images/article-growth.jpg"];

export function HomePage({ content }: { content: HomeContent }) {
  const { settings, partner } = root.useLoaderData();
  const { t, pick } = useI18n();
  const skill = content.programs.find((item) => item.kind === "skill");
  const business = content.programs.find((item) => item.kind === "business");
  const packages = content.programs.filter((item) => item.kind === "package");
  const stats = [
    { label: pick(settings.education_label_en, settings.education_label_hi), caption: pick(settings.education_caption_en, settings.education_caption_hi), icon: GraduationCap },
    { label: pick(settings.experience_label_en, settings.experience_label_hi), caption: pick(settings.experience_caption_en, settings.experience_caption_hi), icon: LineChart },
    ...content.achievements.slice(0, 2).map((item) => ({ label: item.title, caption: item.description || item.category, icon: MessagesSquare })),
  ];
  const general = pick(settings.wa_general_en, settings.wa_general_hi);

  return (
    <main id="main">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-soft),transparent_42%),linear-gradient(180deg,var(--color-cream),var(--color-paper)_70%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <p className="pill">{t("welcome")}</p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
              {t("line1")}
              <span className="mt-1 block">{t("line2a")} <span className="text-royal">{t("line2b")}</span></span>
              <span className="mt-1 block">{t("line3a")} <span className="text-teal-deep">{t("line3b")}</span></span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">{pick(settings.hero_intro_en, settings.hero_intro_hi)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={waUrl(settings.whatsapp_e164, general)} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "hero")}>
                <WhatsAppIcon className="size-4" /> {t("ctaWa")} <ArrowRight className="size-4" />
              </a>
              <a className="btn btn-ghost" href="#programs">{t("ctaPrograms")} <ArrowRight className="size-4" /></a>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Focus icon={GraduationCap} title={t("focusSkill")} />
              <Focus icon={LineChart} title={t("focusBusiness")} />
              <Focus icon={MessagesSquare} title={t("focusGuide")} />
            </div>
          </div>
          <HeroVisual settings={settings} name={settings.person_name} role={pick(settings.role_en, settings.role_hi)} script={t("sameLearning")} words={t("sideWords")} alt={settings.portrait_media_id ? t("portraitAlt") : t("photoAlt")} />
        </div>
      </section>

      <section id="about" className="section-anchor mx-auto grid max-w-6xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("aboutKicker")}</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{pick(settings.about_heading_en, settings.about_heading_hi)}</h2>
          <p className="mt-4 text-muted">{pick(settings.about_body_en, settings.about_body_hi)}</p>
          <Link to="/about" className="btn btn-primary mt-6">{t("knowJourney")} <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((item) => (
            <article key={item.label} className="card grid gap-3 p-5">
              <item.icon className="size-6 text-royal" />
              <p className="text-xl font-extrabold">{item.label}</p>
              <p className="text-sm text-muted">{item.caption}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="journey" className="section-anchor bg-soft/60">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("journeyKicker")}</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{pick(settings.journey_heading_en, settings.journey_heading_hi)}</h2>
            <p className="mt-4 text-muted">{pick(settings.journey_body_en, settings.journey_body_hi)}</p>
            <Link to="/about" className="btn btn-primary mt-6">{t("story")} <ArrowRight className="size-4" /></Link>
          </div>
          <figure className="relative">
            <img
              src={settings.journey_media_id ? `/api/media/${settings.journey_media_id}` : "/images/journey.jpg"}
              alt={t("journeyAlt")}
              className="aspect-[16/10] w-full rounded-[2rem] object-cover"
            />
            <blockquote className="card absolute right-4 bottom-4 max-w-xs p-4 text-sm font-semibold text-ink">
              {pick(settings.journey_quote_en, settings.journey_quote_hi)}
            </blockquote>
          </figure>
        </div>
      </section>

      <section id="programs" className="section-anchor mx-auto max-w-6xl px-4 py-16 md:px-6">
        <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("offerKicker")}</p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("offerTitle")}</h2>
        <p className="mt-3 max-w-2xl text-muted">{t("offerSub")}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {skill ? <ProgramCard program={skill} image="/images/program-skill.jpg" cta={t("exploreSkill")} tone="primary" /> : null}
          {business ? <ProgramCard program={business} image="/images/program-business.jpg" cta={t("exploreBusiness")} tone="teal" /> : null}
        </div>
      </section>

      {partner.enabled ? (
        <section id="partner" className="section-anchor mx-auto grid max-w-6xl gap-6 px-4 pb-8 md:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="card p-6 sm:p-8">
            <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("partnerKicker")}</p>
            <div className="mt-4 flex items-center gap-4">
              <PartnerMark />
              <div>
                <h2 className="text-2xl font-extrabold">{partner.name}</h2>
              </div>
            </div>
            <p className="mt-4 text-muted">{pick(partner.description_en, partner.description_hi)}</p>
            <ul className="mt-4 grid gap-2 text-sm text-muted">
              <li className="flex gap-2"><span className="text-teal-deep">✓</span> {pick("Wide range of learning programs", "कई तरह के लर्निंग प्रोग्राम")}</li>
              <li className="flex gap-2"><span className="text-teal-deep">✓</span> {pick("Practical courses you can ask about", "व्यावहारिक कोर्स, जिनके बारे में पूछा जा सकता है")}</li>
              <li className="flex gap-2"><span className="text-teal-deep">✓</span> {pick("A place to review before you decide", "तय करने से पहले समीक्षा करने की जगह")}</li>
            </ul>
            <p className="mt-4 text-xs leading-5 text-muted">{pick(partner.disclosure_en, partner.disclosure_hi)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={partner.website_url} target="_blank" rel="noreferrer">{t("visitSite")} <ArrowRight className="size-4" /></a>
              <Link to="/programs" className="btn btn-ghost">{t("viewPrograms")} <ArrowRight className="size-4" /></Link>
            </div>
          </article>
          <aside className="card p-6">
            <p className="flex items-center gap-2 font-extrabold"><LogoMark className="size-6 text-royal" /> {t("packages")}</p>
            <div className="mt-4 grid gap-3">
              {packages.map((item) => (
                <Link key={item.id} to="/programs/$slug" params={{ slug: item.slug }} className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-3 py-3">
                  <span className="rounded-xl bg-paper px-3 py-1 text-sm font-extrabold text-royal">{pick(item.title_en, item.title_hi)}</span>
                  <span className="text-right text-sm text-muted">{pick(item.summary_en, item.summary_hi) || t("enquire")}</span>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      ) : null}

      {content.testimonials.length ? (
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <h2 className="text-2xl font-extrabold">Notes from learners</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {content.testimonials.map((item) => (
              <blockquote key={item.id} className="card p-5">
                <p className="text-sm text-muted">{pick(item.content_en, item.content_hi)}</p>
                <footer className="mt-3 text-sm font-extrabold">{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      <section id="knowledge" className="section-anchor mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("knowledgeKicker")}</p>
            <h2 className="mt-2 text-3xl font-extrabold">{t("knowledgeTitle")}</h2>
            <p className="mt-2 max-w-2xl text-muted">{t("knowledgeSub")}</p>
          </div>
          <Link to="/knowledge" className="text-sm font-extrabold text-royal">{t("viewAll")} →</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {content.articles.map((article, index) => (
            <ArticleTile key={article.id} article={article} image={fallbackArticle[index % fallbackArticle.length] ?? fallbackArticle[0]!} />
          ))}
        </div>
      </section>

      <section id="contact" className="section-anchor px-4 py-8 md:px-6">
        <ContactBand />
      </section>
      <JsonLd settings={settings} />
    </main>
  );
}

function Focus({ icon: Icon, title }: { icon: typeof GraduationCap; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper text-royal shadow-card">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-bold leading-5">{title}</p>
    </div>
  );
}

function HeroVisual({ settings, name, role, script, words, alt }: { settings: Settings; name: string; role: string; script: string; words: string; alt: string }) {
  const src = settings.portrait_media_id ? `/api/media/${settings.portrait_media_id}` : "/images/article-home.jpg";
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <p className="script absolute top-2 left-0 z-10 hidden max-w-32 rotate-[-8deg] text-3xl text-royal lg:block">{script}</p>
      <p className="script absolute top-6 right-0 z-10 hidden text-right text-2xl whitespace-pre-line text-deep lg:block">{words}</p>
      <div className="portrait-frame relative mx-auto aspect-[4/5] max-w-md">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
      <div className="card absolute right-2 bottom-4 left-6 flex items-center gap-3 p-3 sm:left-auto sm:max-w-xs">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-royal text-paper">
          <LogoMark className="size-8 text-paper" />
        </span>
        <span>
          <span className="block font-extrabold">{name}</span>
          <span className="block text-sm leading-5 text-muted">{role}</span>
        </span>
      </div>
    </div>
  );
}

function ProgramCard({ program, image, cta, tone }: { program: Program; image: string; cta: string; tone: "primary" | "teal" }) {
  const { pick } = useI18n();
  const src = program.image_media_id ? `/api/media/${program.image_media_id}` : image;
  return (
    <article className="card grid gap-4 p-4 sm:grid-cols-[1fr_0.8fr] sm:p-5">
      <div>
        <span className={`grid size-12 place-items-center rounded-2xl text-paper ${tone === "teal" ? "bg-teal-deep" : "bg-royal"}`}>
          {tone === "teal" ? <LineChart /> : <GraduationCap />}
        </span>
        <h3 className="mt-3 text-xl font-extrabold">{pick(program.title_en, program.title_hi)}</h3>
        <div className="mt-3">
          <CheckList text={pick(program.benefits_en, program.benefits_hi)} />
        </div>
        <Link to="/programs/$slug" params={{ slug: program.slug }} className={`btn mt-5 ${tone === "teal" ? "btn-teal" : "btn-primary"}`}>
          {cta} <ArrowRight className="size-4" />
        </Link>
      </div>
      <img src={src} alt="" className="h-48 w-full rounded-3xl object-cover sm:h-full" />
    </article>
  );
}

export function ArticleTile({ article, image }: { article: ArticleCard; image: string }) {
  const { pick, t } = useI18n();
  const src = article.featured_media_id ? `/api/media/${article.featured_media_id}` : image;
  return (
    <article className="card overflow-hidden">
      <img src={src} alt="" className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="text-xs font-extrabold tracking-wide text-royal uppercase">{pick(article.category_en, article.category_hi)}</p>
        <h3 className="mt-2 font-extrabold leading-snug">{pick(article.title_en, article.title_hi)}</h3>
        <Link to="/knowledge/$slug" params={{ slug: article.slug }} className="mt-3 inline-flex text-sm font-extrabold text-royal">{t("readMore")} →</Link>
      </div>
    </article>
  );
}

export function ContactBand() {
  const { settings } = root.useLoaderData();
  const { t, pick } = useI18n();
  const src = settings.contact_media_id ? `/api/media/${settings.contact_media_id}` : "";
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#211044_0%,#5b2bb0_52%,#0c7c70_100%)] p-5 text-cream md:p-8 lg:grid-cols-[0.8fr_1.1fr_0.7fr]">
      <div>
        <p className="pill bg-paper/15 text-cream shadow-none">{t("contactKicker")}</p>
        <h2 className="mt-4 text-4xl font-extrabold text-paper">{t("contactTitle")}</h2>
        <p className="mt-3 text-cream/90">{t("contactSub")}</p>
        <a className="mt-5 inline-flex items-center gap-2 font-bold text-paper" href={waUrl(settings.whatsapp_e164, pick(settings.wa_general_en, settings.wa_general_hi))} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "contact")}>
          <span className="grid size-10 place-items-center rounded-full bg-whatsapp"><WhatsAppIcon className="size-5" /></span>
          {settings.phone_display}
        </a>
      </div>
      <div className="rounded-[1.5rem] bg-paper p-5 text-ink">
        <h3 className="text-lg font-extrabold">{t("formTitle")}</h3>
        <div className="mt-4"><EnquiryForm /></div>
      </div>
      <div className="relative hidden min-h-72 lg:block">
        {src ? <img src={src} alt={t("portraitAlt")} className="absolute right-0 bottom-0 h-80 w-64 rounded-[2rem] object-cover" /> : (
          <div className="absolute right-0 bottom-0 grid h-72 w-56 place-items-center rounded-[2rem] bg-paper/10">
            <p className="script px-4 text-center text-4xl text-paper">{t("sameLearning")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerMark() {
  return (
    <span className="grid size-16 place-items-center rounded-2xl bg-soft text-royal">
      <LogoMark className="size-10" />
    </span>
  );
}

export function PriceLine({ program }: { program: Program }) {
  const { t } = useI18n();
  const today = todayISO();
  const expired = program.offer_expires && program.offer_expires < today;
  const showOffer = program.show_price && program.offer_price && !expired;
  const showOriginal = program.show_price && program.original_price && (!showOffer || program.original_price !== program.offer_price);
  if (!program.show_price || (!program.offer_price && !program.original_price)) {
    return <p className="font-extrabold text-royal">{t("enquire")}</p>;
  }
  return (
    <p className="flex flex-wrap items-baseline gap-2">
      {program.offer_label ? <span className="rounded-full bg-soft px-2 py-1 text-xs font-extrabold text-royal">{program.offer_label}</span> : null}
      {showOriginal ? <span className={`text-muted ${showOffer ? "line-through" : "text-2xl font-extrabold text-ink no-underline"}`}>{program.original_price}</span> : null}
      {showOffer ? <span className="text-2xl font-extrabold text-ink">{program.offer_price}</span> : null}
    </p>
  );
}

function JsonLd({ settings }: { settings: Settings }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.person_name,
    jobTitle: settings.role_en,
    email: settings.email,
    telephone: `+${settings.whatsapp_e164}`,
    url: settings.site_url || undefined,
    description: settings.seo_description_en,
    alumniOf: settings.education_label_en,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function benefitLines(program: Program, hi: boolean) {
  return lines(hi && program.benefits_hi.trim() ? program.benefits_hi : program.benefits_en);
}
