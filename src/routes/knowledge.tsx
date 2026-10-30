import { createFileRoute } from "@tanstack/react-router";
import { KnowledgePage } from "@/components/site/Pages";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Hub | Digital Khushi" },
      { name: "description", content: "Practical articles on digital marketing, online business, skill development and personal growth by Khushi Aswani." },
    ],
  }),
  component: KnowledgePage,
});
