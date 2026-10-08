"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="site-header">
      <nav className="shell nav">
        <Link className="wordmark" href="/">
          OUTCAST<span>STREETWEAR</span>
        </Link>
        <div className="desktop-links">
          <Link href="/productos">Catálogo</Link>
          <Link href="/oversize">Oversize</Link>
          <Link href="/nosotros">La marca</Link>
          <Link href="/cuenta">Mi cuenta</Link>
        </div>
        <div className="actions">
          <Link href="/carrito" aria-label={`Bolsa con ${totalItems} prendas`}>
            Bolsa ({totalItems})
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-label="Abrir menú"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>
      </nav>
      {open && (
        <div className="mobile-links">
          {[
            ["/productos", "Catálogo"],
            ["/oversize", "Oversize"],
            ["/nosotros", "La marca"],
            ["/cuenta", "Mi cuenta"],
          ].map(([url, label]) => (
            <Link key={url} href={url} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
