import { createFileRoute } from "@tanstack/react-router";
import { publicSitemap } from "@/lib/server/public-fns";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const data = await publicSitemap();
        const origin = data.origin || "";
        const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`;
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
