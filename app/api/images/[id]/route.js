import db from "../../../../lib/db";
export const runtime = "nodejs";
export async function GET(req, { params }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const image = db.prepare("SELECT data FROM images WHERE id=?").get(id);
  if (!image) return new Response(null, { status: 404 });
  return new Response(image.data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
