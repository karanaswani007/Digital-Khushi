import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LanguageProvider } from "@/lib/i18n";
import { SiteChrome } from "@/components/site/Chrome";
import { getShell } from "@/lib/server/public-fns";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getShell(),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.settings.seo_title_en ?? "Digital Khushi" },
      { name: "description", content: loaderData?.settings.seo_description_en ?? "" },
      { name: "theme-color", content: "#211044" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ...(loaderData?.origin ? [{ rel: "canonical", href: loaderData.origin }] : []),
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LanguageProvider>
            <SiteChrome>
              <Outlet />
            </SiteChrome>
          </LanguageProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
