import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/Pages";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Khushi Aswani | Digital Khushi" },
      { name: "description", content: "Send an enquiry to Khushi Aswani about skill development or online business opportunities." },
    ],
  }),
  component: ContactPage,
});
