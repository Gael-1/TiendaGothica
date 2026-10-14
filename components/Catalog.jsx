"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductSelection from "./ProductSelection";
import { categories, sizes, filterProducts } from "../lib/catalog";
import { money } from "../lib/client";
function Card({ p }) {
  return (
    <article className="panel">
      <Link href={`/productos/${p.id}`} className="product-link">
        <div className="product-photo">
          {p.image ? (
            <Image src={p.image} alt={p.name} width={600} height={750} />
          ) : (
            <span>Fotografía pendiente</span>
          )}
        </div>
        <p className="eyebrow">{categories[p.category]}</p>
        <h2>{p.name}</h2>
      </Link>
      <p className="muted">{p.description}</p>
      <strong>{money(p.price)} MXN</strong>
      <ProductSelection product={p} />
    </article>
  );
}
export default function Catalog({ category, featured = false }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [chosenCategory, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("name");
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
  const shown = filterProducts(products || [], {
    search,
    category: category || chosenCategory,
    size,
    available,
    sort,
  });
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
      {!featured && (
        <div className="catalog-filters">
          <label>
            Categoría
            <select
              value={category || chosenCategory}
              disabled={Boolean(category)}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Talla disponible
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Todas</option>
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Ordenar
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Nombre</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Solo disponibles
          </label>
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setSize("");
              setAvailable(false);
              setSort("name");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}
      {!featured && products && (
        <p className="muted" role="status">
          {shown.length} prendas encontradas
        </p>
      )}
      {error ? (
        <p role="alert">{error}</p>
      ) : products === null ? (
        <p>Cargando prendas…</p>
      ) : !shown.length ? (
        <div className="panel">
          <h2>
            {products.length
              ? "Sin resultados"
              : "La colección está en preparación"}
          </h2>
          <p className="muted">
            {products.length
              ? "Prueba con otro nombre o cambia los filtros."
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
