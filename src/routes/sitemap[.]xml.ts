import { createFileRoute } from "@tanstack/react-router";
import { publicSitemap } from "@/lib/server/public-fns";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = await publicSitemap();
        const origin = data.origin || "";
        const urls = ["/", "/about", "/programs", "/partner", "/knowledge", "/contact", ...data.programs.map((slug) => `/programs/${slug}`), ...data.articles.map((slug) => `/knowledge/${slug}`)];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
