import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import db, { product } from "../../../lib/db";
import { money } from "../../../lib/client";
import { categories } from "../../../lib/catalog";
import ProductSelection from "../../../components/ProductSelection";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = db
    .prepare("SELECT name,description FROM products WHERE id=? AND active=1")
    .get(id);
  return {
    title: p
      ? `${p.name} | Outcast Streetwear`
      : "Prenda no disponible | Outcast",
    description:
      p?.description || "Encuentra tu siguiente prenda en Outcast Streetwear.",
  };
}
export default async function Page({ params }) {
  const { id } = await params;
  const row = db
    .prepare("SELECT * FROM products WHERE id=? AND active=1")
    .get(id);
  if (!row) notFound();
  const p = product(row);
  return (
    <section className="shell section">
      <Link href="/productos">← Volver al catálogo</Link>
      <div className="product-detail">
        <div className="product-photo">
          {p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              width={900}
              height={1125}
              priority
            />
          ) : (
            <span>Fotografía pendiente</span>
          )}
        </div>
        <div>
          <p className="eyebrow">OUTCAST / {categories[p.category]}</p>
          <h1>{p.name}</h1>
          <p className="detail-price">{money(p.price)} MXN</p>
          <p className="product-description">
            {p.description ||
              "Consulta los detalles de esta prenda por WhatsApp."}
          </p>
          <ProductSelection product={p} />
          <div className="panel purchase-info">
            <h2>Antes de pedir</h2>
            <p>
              El subtotal no incluye envío. Confirmamos disponibilidad, pago y
              entrega contigo por WhatsApp.
            </p>
            <p>
              Las medidas dependen de cada prenda. Pregúntanos por el ancho y
              largo antes de elegir tu talla.
            </p>
            <a
              href={
                "https://wa.me/528123408200?text=" +
                encodeURIComponent(
                  "Hola, tengo una duda sobre " +
                    p.name +
                    " (" +
                    p.id +
                    "). ¿Me puedes compartir sus medidas y detalles?",
                )
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar esta prenda ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
