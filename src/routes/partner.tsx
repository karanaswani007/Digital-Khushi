import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/site/Pages";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Learning Partner | Digital Khushi" },
      { name: "description", content: "Khushi Aswani collaborates with LeadsGuru EdTech Private Limited. Outcomes are not guaranteed." },
    ],
  }),
  component: PartnerPage,
});
