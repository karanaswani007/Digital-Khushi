import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/site/Pages";
import { getHomeContent } from "@/lib/server/public-fns";

export const Route = createFileRoute("/about")({
  loader: () => getHomeContent(),
  head: () => ({
    meta: [
      { title: "About Khushi Aswani | Digital Khushi" },
      { name: "description", content: "Khushi Aswani, B.Com, with 2 years in digital marketing, shares her journey and how Digital Khushi helps beginners learn." },
    ],
  }),
  component: function About() {
    return <AboutPage content={Route.useLoaderData()} />;
  },
});
