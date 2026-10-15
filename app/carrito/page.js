"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { request, money } from "../../lib/client";
export default function Page() {
  const { cart, ready, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const [me, setMe] = useState(null);
  useEffect(() => {
    fetch("/api/shop?kind=me")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setMe)
      .catch(() => setMe({ role: "guest" }));
  }, []);
  async function checkout(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const f = new FormData(e.currentTarget);
      const o = await request({
        action: "order",
        name: f.get("name"),
        phone: f.get("phone"),
        delivery: f.get("delivery"),
        items: cart.map(({ id, size, quantity }) => ({ id, size, quantity })),
      });
      setOrder(o);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return <section className="shell section">Cargando bolsa…</section>;
  return (
    <section className="shell section">
      <p className="eyebrow">TU SELECCIÓN</p>
      <h1>La bolsa</h1>
      {!cart.length ? (
        <div className="panel">
          <p>Tu bolsa está vacía.</p>
          <Link className="button" href="/productos">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <div>
            {cart.map((i) => (
              <article className="cart-row panel" key={i.id + i.size}>
                <div>
                  <h2>{i.name}</h2>
                  <p>
                    Talla {i.size} · {money(i.price)} MXN c/u
                  </p>
                </div>
                <div>
                  <label>
                    Cantidad
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={i.quantity}
                      onChange={(e) => {
                        updateQuantity(i.id, i.size, Number(e.target.value));
                        setOrder(null);
                      }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      removeFromCart(i.id, i.size);
                      setOrder(null);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
            <button
              onClick={() => {
                clearCart();
                setOrder(null);
              }}
            >
              Vaciar bolsa
            </button>
          </div>
          <form
            className="panel"
            onSubmit={checkout}
            onChange={() => setOrder(null)}
          >
            <h2>Resumen del pedido</h2>
            {me?.role === "guest" && (
              <div className="checkout-login">
                <p>
                  ¿Ya tienes cuenta? Inicia sesión para guardar este pedido en
                  tu historial.
                </p>
                <Link href="/login?next=/carrito">
                  Iniciar sesión o crear cuenta ↗
                </Link>
                <p className="muted">
                  También puedes completar el formulario como invitado.
                </p>
              </div>
            )}
            {me?.role === "customer" && (
              <p className="muted">
                Sesión iniciada: {me.name}. Este pedido aparecerá en tu cuenta.
              </p>
            )}
            <p>
              Subtotal: <strong>{money(totalPrice)} MXN</strong>
            </p>
            <p className="muted">
              El servidor verifica precios y existencias. Envío por cotizar. El
              pedido queda pendiente hasta que lo confirmemos contigo.
            </p>
            <label>
              Nombre
              <input name="name" required maxLength="100" autoComplete="name" />
            </label>
            <label>
              Teléfono
              <input
                name="phone"
                type="tel"
                required
                pattern="[+0-9 ()-]{10,25}"
                autoComplete="tel"
              />
            </label>
            <label>
              Entrega
              <select name="delivery">
                <option value="pickup">Recoger (coordinar punto)</option>
                <option value="shipping">Envío (cotizar)</option>
              </select>
            </label>
            <button className="button" disabled={busy}>
              {busy ? "Verificando…" : "Preparar pedido por WhatsApp"}
            </button>
            {error && <p role="alert">{error}</p>}
            {order && (
              <div role="status">
                <p>
                  Solicitud #{order.id.slice(0, 8)} preparada. Abre WhatsApp y
                  envía el mensaje para confirmar.
                </p>
                <a
                  className="button whatsapp"
                  href={order.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir WhatsApp y enviar ↗
                </a>
                <p className="muted">
                  Si no se abre, contacta al +52 81 2340 8200 e indica tu folio.
                </p>
              </div>
            )}
          </form>
        </div>
      )}
    </section>
  );
}
