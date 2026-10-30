import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Digital Khushi" }, { name: "robots", content: "noindex" }] }),
  component: () => <Outlet />,
});
