import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = String(params.id ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80);
        if (!id) return new Response("Not found", { status: 404 });
        const sql = await getSql();
        const rows = await sql<{ mime: string; data_base64: string }>`select mime, data_base64 from media_assets where id = ${id} limit 1`;
        const row = rows[0];
        if (!row) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(Buffer.from(row.data_base64, "base64"));
        return new Response(bytes, {
          headers: {
            "content-type": row.mime,
            "cache-control": "public, max-age=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
