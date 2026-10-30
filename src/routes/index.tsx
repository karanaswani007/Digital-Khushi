import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/HomePage";
import { getHomeContent } from "@/lib/server/public-fns";

export const Route = createFileRoute("/")({
  loader: () => getHomeContent(),
  component: function Index() {
    const content = Route.useLoaderData();
    return <HomePage content={content} />;
  },
});
