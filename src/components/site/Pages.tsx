import { Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Article, ArticleCard, Category, Faq, HomeContent, Program } from "@/lib/types";
import { waUrl, youtubeId } from "@/lib/utils";
import { listArticles, listCategories } from "@/lib/server/public-fns";
import { track } from "@/components/site/analytics";
import { ArticleTile, ContactBand, PriceLine } from "@/components/site/HomePage";
import { CheckList, RichText } from "@/components/site/Chrome";
import { WhatsAppIcon } from "@/components/site/Logo";

const root = getRouteApi("__root__");
const images = ["/images/article-marketing.jpg", "/images/article-home2.jpg", "/images/article-growth.jpg"];

export function AboutPage({ content }: { content: HomeContent }) {
  const { settings } = root.useLoaderData();
  const { t, pick } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("aboutKicker")}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{pick(settings.about_heading_en, settings.about_heading_hi)}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{pick(settings.about_body_en, settings.about_body_hi)}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <article className="card p-5"><p className="text-2xl font-extrabold">{pick(settings.education_label_en, settings.education_label_hi)}</p><p className="text-sm text-muted">{pick(settings.education_caption_en, settings.education_caption_hi)}</p></article>
        <article className="card p-5"><p className="text-2xl font-extrabold">{pick(settings.experience_label_en, settings.experience_label_hi)}</p><p className="text-sm text-muted">{pick(settings.experience_caption_en, settings.experience_caption_hi)}</p></article>
      </div>
      <section className="mt-12 grid items-start gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold">{pick(settings.journey_heading_en, settings.journey_heading_hi)}</h2>
          <p className="mt-4 text-muted">{pick(settings.journey_body_en, settings.journey_body_hi)}</p>
        </div>
        <img src={settings.journey_media_id ? `/api/media/${settings.journey_media_id}` : "/images/journey.jpg"} alt={t("journeyAlt")} className="aspect-[16/10] w-full rounded-[2rem] object-cover" />
      </section>
      {content.milestones.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">{t("milestones")}</h2>
          <ol className="mt-4 grid gap-4">
            {content.milestones.map((item) => (
              <li key={item.id} className="card p-5">
                <p className="text-xs font-extrabold text-royal">{item.date_label}</p>
                <h3 className="mt-1 text-xl font-extrabold">{pick(item.title_en, item.title_hi)}</h3>
                <p className="mt-2 text-muted">{pick(item.body_en, item.body_hi)}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {content.certifications.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">{t("certifications")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {content.certifications.map((item) => (
              <article key={item.id} className="card p-5">
                <h3 className="font-extrabold">{item.name}</h3>
                <p className="text-sm text-muted">{item.issuer} {item.date_label}</p>
                {item.credential_url ? <a className="mt-2 inline-block text-sm font-bold text-royal" href={item.credential_url} target="_blank" rel="noreferrer">View credential</a> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export function ProgramsPage({ programs }: { programs: Program[] }) {
  const { partner } = root.useLoaderData();
  const { t, pick } = useI18n();
  const main = programs.filter((item) => item.kind !== "package");
  const packages = programs.filter((item) => item.kind === "package");
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("offerKicker")}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{t("offerTitle")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("offerSub")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {main.map((program) => (
          <article key={program.id} className="card p-6">
            <h2 className="text-2xl font-extrabold">{pick(program.title_en, program.title_hi)}</h2>
            <p className="mt-2 text-muted">{pick(program.summary_en, program.summary_hi)}</p>
            <div className="mt-3"><CheckList text={pick(program.benefits_en, program.benefits_hi)} /></div>
            <Link to="/programs/$slug" params={{ slug: program.slug }} className="btn btn-primary mt-5">{pick(program.cta_en, program.cta_hi) || t("viewPrograms")}</Link>
          </article>
        ))}
      </div>
      <h2 className="mt-12 text-2xl font-extrabold">{t("packages")}</h2>
      <p className="mt-2 text-sm text-muted">{pick(partner.disclosure_en, partner.disclosure_hi)}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((program) => (
          <Link key={program.id} to="/programs/$slug" params={{ slug: program.slug }} className="card p-5">
            <p className="text-lg font-extrabold text-royal">{pick(program.title_en, program.title_hi)}</p>
            <p className="mt-1 text-sm text-muted">{pick(program.summary_en, program.summary_hi)}</p>
            <div className="mt-3"><PriceLine program={program} /></div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function ProgramDetail({ program, faqs }: { program: Program; faqs: Faq[] }) {
  const { settings, partner } = root.useLoaderData();
  const { t, pick } = useI18n();
  useEffect(() => {
    track("program_view", program.slug);
  }, [program.slug]);
  const message = program.kind === "business"
    ? pick(settings.wa_business_en, settings.wa_business_hi)
    : `${pick(settings.wa_skill_en, settings.wa_skill_hi)} (${pick(program.title_en, program.title_hi)})`;
  const facts = [
    [t("duration"), pick(program.duration_en, program.duration_hi)],
    [t("format"), pick(program.format_en, program.format_hi)],
    [t("eligibility"), pick(program.eligibility_en, program.eligibility_hi)],
  ].filter(([, value]) => value);
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-sm font-bold text-muted"><Link to="/programs" className="text-royal">{t("programs")}</Link> / {pick(program.title_en, program.title_hi)}</p>
      <h1 className="mt-3 text-4xl font-extrabold">{pick(program.title_en, program.title_hi)}</h1>
      <p className="mt-4 text-lg text-muted">{pick(program.summary_en, program.summary_hi)}</p>
      <div className="mt-4"><PriceLine program={program} /></div>
      <div className="mt-6"><RichText text={pick(program.description_en, program.description_hi)} /></div>
      <div className="mt-4"><CheckList text={pick(program.benefits_en, program.benefits_hi)} /></div>
      {facts.length ? (
        <dl className="mt-6 grid gap-3">
          {facts.map(([label, value]) => (
            <div key={label} className="card p-4">
              <dt className="text-xs font-extrabold tracking-wide text-royal uppercase">{label}</dt>
              <dd className="mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {pick(program.conditions_en, program.conditions_hi) ? (
        <p className="mt-6 rounded-2xl bg-soft p-4 text-sm text-muted"><strong className="text-ink">{t("conditions")}. </strong>{pick(program.conditions_en, program.conditions_hi)}</p>
      ) : null}
      {partner.enabled ? <p className="mt-4 text-sm text-muted">{pick(partner.disclosure_en, partner.disclosure_hi)} <a className="font-bold text-royal" href={partner.website_url} target="_blank" rel="noreferrer">{partner.name}</a></p> : null}
      <a className="btn btn-wa mt-6" href={waUrl(settings.whatsapp_e164, message)} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", program.slug)}>
        <WhatsAppIcon className="size-4" /> {t("enquireWa")}
      </a>
      {faqs.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">{t("faqs")}</h2>
          <div className="mt-4 grid gap-3">
            {faqs.map((faq) => (
              <article key={faq.id} className="card p-4">
                <h3 className="font-extrabold">{pick(faq.question_en, faq.question_hi)}</h3>
                <p className="mt-2 text-sm text-muted">{pick(faq.answer_en, faq.answer_hi)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export function KnowledgePage() {
  const { t, pick } = useI18n();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  useEffect(() => {
    void listCategories().then(setCategories);
  }, []);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      void listArticles({ data: { q, category } }).then(setArticles);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [q, category]);
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("knowledgeKicker")}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{t("knowledgeTitle")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("knowledgeSub")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="field flex-1">
          {t("search")}
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t("search")} />
        </label>
        <label className="field sm:w-64">
          {t("allTopics")}
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t("allTopics")}</option>
            {categories.map((item) => <option key={item.id} value={item.slug}>{pick(item.name_en, item.name_hi)}</option>)}
          </select>
        </label>
      </div>
      {articles.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {articles.map((article, index) => <ArticleTile key={article.id} article={article} image={images[index % images.length]!} />)}
        </div>
      ) : <p className="mt-8 text-muted">{t("noArticles")}</p>}
    </main>
  );
}

export function ArticlePage({ article, related }: { article: Article; related: ArticleCard[] }) {
  const { t, pick } = useI18n();
  const video = youtubeId(article.youtube_id);
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title_en,
    datePublished: article.published_on,
    description: article.seo_description_en || article.excerpt_en,
    author: { "@type": "Person", name: "Khushi Aswani" },
  };
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-sm font-bold text-muted">
        <Link to="/" className="text-royal">{t("home")}</Link> / <Link to="/knowledge" className="text-royal">{t("knowledge")}</Link>
      </p>
      <p className="mt-4 text-xs font-extrabold tracking-wide text-royal uppercase">{pick(article.category_en, article.category_hi)}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{pick(article.title_en, article.title_hi)}</h1>
      <p className="mt-2 text-sm text-muted">{article.published_on}</p>
      {article.featured_media_id ? <img src={`/api/media/${article.featured_media_id}`} alt="" className="mt-6 aspect-[16/9] w-full rounded-[2rem] object-cover" /> : null}
      <RichText text={pick(article.body_en, article.body_hi)} />
      {video ? (
        <div className="mt-6 aspect-video overflow-hidden rounded-[1.5rem]">
          <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video}`} title={pick(article.title_en, article.title_hi)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      ) : null}
      {article.resource_media_id ? (
        <a className="btn btn-ghost mt-6" href={`/api/media/${article.resource_media_id}`} download>{pick(article.resource_label_en, article.resource_label_hi) || "Download"}</a>
      ) : null}
      {related.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">{t("related")}</h2>
          <div className="mt-4 grid gap-3">
            {related.map((item) => (
              <Link key={item.id} to="/knowledge/$slug" params={{ slug: item.slug }} className="font-bold text-royal">{pick(item.title_en, item.title_hi)}</Link>
            ))}
          </div>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
    </main>
  );
}

export function PartnerPage() {
  const { partner } = root.useLoaderData();
  const { t, pick } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-sm font-extrabold tracking-[0.14em] text-royal uppercase">{t("partnerKicker")}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{partner.name}</h1>
      <p className="mt-4 text-lg text-muted">{pick(partner.description_en, partner.description_hi)}</p>
      <p className="mt-4 text-sm text-muted">{pick(partner.disclosure_en, partner.disclosure_hi)}</p>
      {partner.enabled ? <a className="btn btn-primary mt-6" href={partner.website_url} target="_blank" rel="noreferrer">{t("visitSite")}</a> : <p className="mt-6 text-muted">This section is currently hidden.</p>}
      <p className="mt-6"><Link to="/programs" className="font-extrabold text-royal">{t("viewPrograms")} →</Link></p>
    </main>
  );
}

export function ContactPage() {
  return (
    <main id="main" className="py-8">
      <ContactBand />
    </main>
  );
}
