import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticlePage } from "@/components/site/Pages";
import { getArticle } from "@/lib/server/public-fns";

export const Route = createFileRoute("/knowledge/$slug")({
  loader: async ({ params }) => {
    const result = await getArticle({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.article.seo_title_en || loaderData?.article.title_en || "Article" },
      { name: "description", content: loaderData?.article.seo_description_en || loaderData?.article.excerpt_en || "" },
    ],
  }),
  notFoundComponent: () => (
    <main id="main" className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Article not found</h1>
      <Link to="/knowledge" className="btn btn-primary mt-6">Knowledge Hub</Link>
    </main>
  ),
  component: function ArticleRoute() {
    const data = Route.useLoaderData();
    return <ArticlePage article={data.article} related={data.related} />;
  },
});
