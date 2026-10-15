import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import db from "../../../lib/db";
export const runtime = "nodejs";
const MAX = 5 * 1024 * 1024;
export async function POST(req) {
  try {
    if (
      !req.headers.get("origin") ||
      new URL(req.headers.get("origin")).host !== req.headers.get("host")
    )
      return NextResponse.json(
        { error: "Origen no permitido." },
        { status: 403 },
      );
  } catch {
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 },
    );
  }
  const token = (await cookies()).get("shop_session")?.value;
  const s = token
    ? db
        .prepare("SELECT role FROM sessions WHERE token=? AND expires>?")
        .get(token, Date.now())
    : null;
  if (s?.role !== "admin")
    return NextResponse.json(
      { error: "Solo el administrador puede subir imágenes." },
      { status: 403 },
    );
  const length = Number(req.headers.get("content-length"));
  if (length > MAX + 65536)
    return NextResponse.json(
      { error: "La imagen debe pesar máximo 5 MB." },
      { status: 413 },
    );
  try {
    const f = await req.formData();
    const file = f.get("image");
    if (!(file instanceof File) || !file.size || file.size > MAX)
      return NextResponse.json(
        { error: "Selecciona una imagen de máximo 5 MB." },
        { status: 400 },
      );
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return NextResponse.json(
        { error: "Usa JPG, PNG o WebP." },
        { status: 400 },
      );
    const source = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25000000,
      animated: false,
    });
    const meta = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format) || meta.pages > 1)
      throw Error("Formato inválido");
    const bytes = await source
      .rotate()
      .resize({
        width: 1600,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const id = randomUUID();
    db.prepare("INSERT INTO images (id,data) VALUES (?,?)").run(id, bytes);
    return NextResponse.json({ url: "/api/images/" + id }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos procesar la foto. Selecciona un JPG, PNG o WebP válido.",
      },
      { status: 400 },
    );
  }
}
