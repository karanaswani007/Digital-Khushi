import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/server/public-fns";

function sessionId() {
  let id = window.sessionStorage.getItem("dk-sid");
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem("dk-sid", id);
  }
  return id;
}

export function track(event: string, meta = "") {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("dk-consent") !== "yes") return;
  const params = new URLSearchParams(window.location.search);
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).host : "";
  } catch {
    host = "";
  }
  void trackEvent({
    data: {
      event,
      meta,
      sessionId: sessionId(),
      path: window.location.pathname,
      referrerHost: host,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      device: window.innerWidth < 768 ? "mobile" : "desktop",
    },
  });
}

export function PageViews() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    const stamp = window.sessionStorage.getItem(`dk-pv:${path}`);
    if (stamp && Date.now() - Number(stamp) < 1500) return;
    window.sessionStorage.setItem(`dk-pv:${path}`, String(Date.now()));
    track("page_view");
  }, [path]);
  return null;
}

export function leadContext() {
  const params = new URLSearchParams(window.location.search);
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).host : "";
  } catch {
    host = "";
  }
  return {
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrerHost: host,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  };
}
