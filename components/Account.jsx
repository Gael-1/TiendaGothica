"use client";
import { useEffect, useState, useCallback } from "react";
import { request, money, statuses } from "../lib/client";
export default function Account({ admin = false }) {
  const [me, setMe] = useState(null),
    [orders, setOrders] = useState([]),
    [products, setProducts] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [register, setRegister] = useState(false),
    [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    const r = await fetch("/api/shop?kind=me");
    if (!r.ok) throw Error("No se pudo cargar la cuenta.");
    const m = await r.json();
    setMe(m);
    if (m.role !== "guest") {
      const o = await fetch("/api/shop?kind=orders");
      if (!o.ok) throw Error("No se pudieron cargar los pedidos.");
      setOrders(await o.json());
      if (admin && m.role === "admin") {
        const p = await fetch("/api/shop?kind=admin");
        if (!p.ok) throw Error("No se pudieron cargar los productos.");
        setProducts(await p.json());
      }
    } else {
      setOrders([]);
      setProducts([]);
    }
  }, [admin]);
  useEffect(() => {
    Promise.resolve()
      .then(load)
      .catch((e) => setError(e.message));
  }, [load]);
  async function act(body) {
    setBusy(true);
    setError("");
    try {
      await request(body);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function auth(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await act({
      action: admin ? "adminLogin" : register ? "register" : "login",
      name: f.get("name"),
      email: f.get("email"),
      password: f.get("password"),
    });
  }
  async function save(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const stock = Object.fromEntries(
      ["XS", "S", "M", "L", "XL", "XXL"].map((s) => [s, Number(f.get(s))]),
    );
    if (
      await act({
        action: "saveProduct",
        id: editing?.id,
        name: f.get("name"),
        description: f.get("description"),
        price: Number(f.get("price")),
        category: f.get("category"),
        image: f.get("image"),
        active: f.get("active") === "on",
        stock,
      })
    ) {
      setEditing(null);
      form.reset();
    }
  }
  const allowed = admin ? me?.role === "admin" : me && me.role !== "guest";
  return (
    <section className="shell section">
      <p className="eyebrow">{admin ? "ADMINISTRACIÓN" : "ÁREA DE CLIENTE"}</p>
      <h1>{admin ? "Tu tienda, en orden." : "Mi cuenta"}</h1>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {!me ? (
        <p>Cargando…</p>
      ) : !allowed ? (
        <form className="panel narrow" onSubmit={auth}>
          <h2>
            {admin
              ? "Acceso de administrador"
              : register
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </h2>
          {!admin && (
            <>
              {register && (
                <label>
                  Nombre
                  <input
                    name="name"
                    required
                    maxLength="100"
                    autoComplete="name"
                  />
                </label>
              )}
              <label>
                Correo
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
            </>
          )}
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              required
              minLength={admin ? 12 : 10}
              maxLength="200"
              autoComplete={register ? "new-password" : "current-password"}
            />
          </label>
          <button className="button" disabled={busy}>
            Entrar
          </button>
          {!admin && (
            <button type="button" onClick={() => setRegister(!register)}>
              {register ? "Ya tengo cuenta" : "Crear una cuenta"}
            </button>
          )}
          <p className="muted">
            {admin
              ? "Acceso protegido. La contraseña se configura en el servidor."
              : "Puedes comprar por WhatsApp sin cuenta. Los pedidos hechos con sesión iniciada aparecen aquí."}
          </p>
        </form>
      ) : (
        <>
          <div className="actions">
            <p>{me.name || "Administrador"}</p>
            <button disabled={busy} onClick={() => act({ action: "logout" })}>
              Cerrar sesión
            </button>
          </div>
          {admin && (
            <div className="admin-grid">
              <form
                key={editing?.id || "new"}
                className="panel"
                onSubmit={save}
              >
                <h2>{editing ? "Editar prenda" : "Nueva prenda"}</h2>
                <label>
                  Nombre
                  <input
                    name="name"
                    required
                    maxLength="150"
                    defaultValue={editing?.name}
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    name="description"
                    maxLength="2000"
                    defaultValue={editing?.description}
                  />
                </label>
                <label>
                  Precio MXN
                  <input
                    name="price"
                    type="number"
                    min="0.01"
                    max="100000"
                    step="0.01"
                    required
                    defaultValue={editing?.price}
                  />
                </label>
                <label>
                  Categoría
                  <select
                    name="category"
                    defaultValue={editing?.category || "oversize"}
                  >
                    <option value="oversize">Oversize</option>
                    <option value="clasica">Clásica</option>
                    <option value="hoodie">Hoodie</option>
                  </select>
                </label>
                <label>
                  Foto (archivo en public)
                  <input
                    name="image"
                    placeholder="/playera.jpg"
                    defaultValue={editing?.image}
                  />
                </label>
                <div className="sizes">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <label key={s}>
                      {s}
                      <input
                        name={s}
                        type="number"
                        min="0"
                        max="10000"
                        required
                        defaultValue={editing?.stock[s] || 0}
                      />
                    </label>
                  ))}
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editing ? editing.active : true}
                  />
                  Visible en catálogo
                </label>
                <button className="button" disabled={busy}>
                  Guardar prenda
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(null)}>
                    Cancelar edición
                  </button>
                )}
              </form>
              <div className="panel">
                <h2>Productos ({products.length})</h2>
                <p className="muted">
                  No se publican prendas de ejemplo. Agrega tus productos y
                  fotografías reales.
                </p>
                {products.map((p) => (
                  <div className="admin-row" key={p.id}>
                    <strong>{p.name}</strong>
                    <p>
                      {money(p.price)} · {p.active ? "Visible" : "Oculto"}
                    </p>
                    <p>
                      {Object.entries(p.stock)
                        .map(([s, n]) => `${s}: ${n}`)
                        .join(" / ")}
                    </p>
                    <button onClick={() => setEditing(p)}>Editar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h2 className="section-title">Pedidos ({orders.length})</h2>
          {!orders.length ? (
            <p className="muted">Todavía no hay pedidos.</p>
          ) : (
            orders.map((o) => (
              <article className="panel order" key={o.id}>
                <div className="section-heading">
                  <h3>#{o.id.slice(0, 8)}</h3>
                  <strong>{statuses[o.status]}</strong>
                </div>
                <p>
                  {new Date(o.created).toLocaleString("es-MX")} ·{" "}
                  {money(o.total)} MXN
                </p>
                {admin && (
                  <p>
                    {o.name} · {o.phone} ·{" "}
                    {o.delivery === "pickup" ? "Recoger" : "Envío"}
                  </p>
                )}
                <ul>
                  {o.items.map((i) => (
                    <li key={i.id + i.size}>
                      {i.quantity} × {i.name} / {i.size} / {money(i.price)} c/u
                    </li>
                  ))}
                </ul>
                {admin && (
                  <div className="actions">
                    {(
                      {
                        pending: ["confirmed", "cancelled"],
                        confirmed: ["shipped", "cancelled"],
                        shipped: ["completed"],
                        completed: [],
                        cancelled: [],
                      }[o.status] || []
                    ).map((status) => (
                      <button
                        key={status}
                        disabled={busy}
                        onClick={() =>
                          act({ action: "status", id: o.id, status })
                        }
                      >
                        {statuses[status]}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
          {admin && (
            <p className="muted">
              Confirmar descuenta existencias de forma atómica. Cancelar un
              pedido confirmado las devuelve. Los pedidos pendientes no reservan
              stock. Confirma el pago y la entrega con el cliente antes de
              avanzar el estado.
            </p>
          )}
        </>
      )}
    </section>
  );
}
