"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const [role, setRole] = useState("guest");
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/shop?kind=me")
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((me) => {
          if (active) setRole(me.role);
        })
        .catch(() => {
          if (active) setRole("guest");
        });
    refresh();
    window.addEventListener("outcast-session", refresh);
    return () => {
      active = false;
      window.removeEventListener("outcast-session", refresh);
    };
  }, [pathname]);
  const accountHref =
    role === "admin" ? "/admin" : role === "customer" ? "/cuenta" : "/login";
  const accountLabel =
    role === "admin"
      ? "Administración"
      : role === "customer"
        ? "Mi cuenta"
        : "Iniciar sesión";
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
          <Link href={accountHref}>{accountLabel}</Link>
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
            [accountHref, accountLabel],
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
