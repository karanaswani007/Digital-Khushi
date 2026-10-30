import { createFileRoute } from "@tanstack/react-router";
import { ProgramsPage } from "@/components/site/Pages";
import { listPrograms } from "@/lib/server/public-fns";

export const Route = createFileRoute("/programs")({
  loader: () => listPrograms(),
  head: () => ({
    meta: [
      { title: "Programs | Digital Khushi" },
      { name: "description", content: "Explore skill development programs and online business opportunities shared by Khushi Aswani. Pricing appears only when it is set. Income is not guaranteed." },
    ],
  }),
  component: function Programs() {
    return <ProgramsPage programs={Route.useLoaderData()} />;
  },
});
