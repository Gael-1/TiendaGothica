"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { money } from "../lib/client";
function Card({ p }) {
  const { addToCart } = useCart();
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  return (
    <article className="panel">
      <div className="product-photo">
        {p.image ? (
          <Image src={p.image} alt={p.name} width={600} height={750} />
        ) : (
          <span>Fotografía pendiente</span>
        )}
      </div>
      <p className="eyebrow">{p.category}</p>
      <h2>{p.name}</h2>
      <p className="muted">{p.description}</p>
      <strong>{money(p.price)} MXN</strong>
      <label>
        Talla
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="">Selecciona una talla</option>
          {Object.entries(p.stock).map(([s, n]) => (
            <option key={s} value={s} disabled={!n}>
              {s} — {n ? "Disponible" : "Agotada"}
            </option>
          ))}
        </select>
      </label>
      <button
        className="button"
        disabled={!size || !p.stock[size]}
        onClick={() => {
          addToCart(p, size, 1);
          setMessage("Añadido a tu bolsa.");
        }}
      >
        Añadir a la bolsa
      </button>
      <p role="status">{message}</p>
    </article>
  );
}
export default function Catalog({ category, featured = false }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/api/shop")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setProducts)
      .catch(() =>
        setError("No pudimos cargar el catálogo. Recarga la página."),
      );
  }, []);
  const shown = (products || []).filter(
    (p) =>
      (!category || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="shell section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">OUTCAST / COLLECTION</p>
          <h1>{featured ? "Explora la colección" : "Catálogo"}</h1>
        </div>
        {featured ? (
          <Link href="/productos">Ver todo ↗</Link>
        ) : (
          <input
            aria-label="Buscar prendas"
            placeholder="Buscar prendas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : products === null ? (
        <p>Cargando prendas…</p>
      ) : !shown.length ? (
        <div className="panel">
          <h2>
            {search ? "Sin resultados" : "La colección está en preparación"}
          </h2>
          <p className="muted">
            {search
              ? "Prueba con otro nombre."
              : "Pronto encontrarás aquí las prendas disponibles. Puedes consultarnos por WhatsApp."}
          </p>
          <a
            href="https://wa.me/528123408200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp ↗
          </a>
        </div>
      ) : (
        <div className="product-grid">
          {(featured ? shown.slice(0, 3) : shown).map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
