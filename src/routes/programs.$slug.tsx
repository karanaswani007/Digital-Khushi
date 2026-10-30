import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProgramDetail } from "@/components/site/Pages";
import { getProgram } from "@/lib/server/public-fns";

export const Route = createFileRoute("/programs/$slug")({
  loader: async ({ params }) => {
    const result = await getProgram({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.program.title_en} | Digital Khushi` : "Program" },
      { name: "description", content: loaderData?.program.summary_en ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <main id="main" className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">This program is not published</h1>
      <Link to="/programs" className="btn btn-primary mt-6">View programs</Link>
    </main>
  ),
  component: function ProgramRoute() {
    const data = Route.useLoaderData();
    return <ProgramDetail program={data.program} faqs={data.faqs} />;
  },
});
