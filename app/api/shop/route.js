import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import db, { product, hashPassword, verifyPassword } from "../../../lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function session() {
  const token = (await cookies()).get("shop_session")?.value;
  return token
    ? db
        .prepare("SELECT * FROM sessions WHERE token=? AND expires>?")
        .get(token, Date.now())
    : null;
}
function reply(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function GET(req) {
  const s = await session();
  const kind = new URL(req.url).searchParams.get("kind");
  if (kind === "me") {
    const u = s?.user_id
      ? db.prepare("SELECT name,email FROM users WHERE id=?").get(s.user_id)
      : null;
    return reply({ role: s?.role || "guest", ...u });
  }
  if (kind === "orders") {
    if (!s) return reply({ error: "Inicia sesión." }, 401);
    const rows =
      s.role === "admin"
        ? db.prepare("SELECT * FROM orders ORDER BY created DESC").all()
        : db
            .prepare(
              "SELECT * FROM orders WHERE user_id=? ORDER BY created DESC",
            )
            .all(s.user_id);
    return reply(
      rows.map((r) => ({
        ...r,
        items: JSON.parse(r.items),
        total: r.total / 100,
      })),
    );
  }
  if (kind === "admin" && s?.role !== "admin")
    return reply({ error: "Acceso restringido." }, 403);
  return reply(
    db
      .prepare(
        kind === "admin"
          ? "SELECT * FROM products"
          : "SELECT * FROM products WHERE active=1",
      )
      .all()
      .map(product),
  );
}
export async function POST(req) {
  try {
    if (
      !req.headers.get("origin") ||
      new URL(req.headers.get("origin")).host !== req.headers.get("host")
    )
      return reply({ error: "Origen no permitido." }, 403);
  } catch {
    return reply({ error: "Origen no permitido." }, 403);
  }
  try {
    const b = await req.json();
    const s = await session();
    if (b.action === "logout") {
      if (s) db.prepare("DELETE FROM sessions WHERE token=?").run(s.token);
      const r = reply({ ok: true });
      r.cookies.set("shop_session", "", { path: "/", maxAge: 0 });
      return r;
    }
    if (["login", "register", "adminLogin"].includes(b.action)) {
      const email = String(b.email || "")
        .trim()
        .toLowerCase();
      const password = String(b.password || "");
      const key = b.action === "adminLogin" ? "admin" : email;
      const attempt = db.prepare("SELECT * FROM attempts WHERE key=?").get(key);
      if (attempt && attempt.until > Date.now() && attempt.count >= 10)
        return reply({ error: "Demasiados intentos. Espera 15 minutos." }, 429);
      db.prepare(
        "INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<? THEN 1 ELSE count+1 END, until=CASE WHEN until<? THEN excluded.until ELSE until END",
      ).run(key, Date.now() + 900000, Date.now(), Date.now());
      let userId = null,
        role = "customer";
      if (b.action === "adminLogin") {
        const expected = process.env.ADMIN_PASSWORD;
        if (!expected || expected.length < 12)
          return reply(
            {
              error:
                "Configura ADMIN_PASSWORD (mínimo 12 caracteres) en el servidor.",
            },
            503,
          );
        const a = Buffer.from(password),
          c = Buffer.from(expected);
        if (a.length !== c.length || !timingSafeEqual(a, c))
          return reply({ error: "Credenciales incorrectas." }, 401);
        role = "admin";
      } else {
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          email.length > 200 ||
          password.length < 10 ||
          password.length > 200
        )
          return reply(
            {
              error:
                "Introduce un correo válido y una contraseña de 10 a 200 caracteres.",
            },
            400,
          );
        if (b.action === "register") {
          if (!String(b.name || "").trim() || String(b.name).length > 100)
            return reply(
              { error: "Introduce tu nombre (máximo 100 caracteres)." },
              400,
            );
          if (db.prepare("SELECT id FROM users WHERE email=?").get(email))
            return reply({ error: "Ese correo ya tiene cuenta." }, 409);
          userId = randomUUID();
          db.prepare("INSERT INTO users VALUES (?,?,?,?)").run(
            userId,
            email,
            b.name.trim(),
            hashPassword(password),
          );
        } else {
          const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
          if (!u || !verifyPassword(password, u.hash))
            return reply({ error: "Credenciales incorrectas." }, 401);
          userId = u.id;
        }
      }
      db.prepare("DELETE FROM attempts WHERE key=?").run(key);
      db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
      const token = randomBytes(32).toString("hex");
      db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
        token,
        userId,
        role,
        Date.now() + 86400000,
      );
      const r = reply({ ok: true, role });
      r.cookies.set("shop_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400,
      });
      return r;
    }
    if (b.action === "saveProduct") {
      if (s?.role !== "admin")
        return reply({ error: "Acceso restringido." }, 403);
      if (
        !b.name?.trim() ||
        b.name.length > 150 ||
        !Number.isFinite(b.price) ||
        b.price <= 0 ||
        b.price > 100000 ||
        !["oversize", "clasica", "hoodie"].includes(b.category)
      )
        return reply({ error: "Revisa nombre, precio y categoría." }, 400);
      const stock = b.stock;
      if (
        !stock ||
        !Object.keys(stock).length ||
        Object.keys(stock).some(
          (k) => !["XS", "S", "M", "L", "XL", "XXL"].includes(k),
        ) ||
        Object.values(stock).some(
          (n) => !Number.isInteger(n) || n < 0 || n > 10000,
        )
      )
        return reply({ error: "Existencias inválidas por talla." }, 400);
      if (b.image && !/^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(b.image))
        return reply(
          {
            error:
              "La foto debe ser una ruta local de public, por ejemplo /playera.jpg.",
          },
          400,
        );
      const id = b.id || randomUUID();
      db.prepare(
        "INSERT INTO products VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,price=excluded.price,category=excluded.category,image=excluded.image,stock=excluded.stock,active=excluded.active",
      ).run(
        id,
        b.name.trim(),
        String(b.description || "").slice(0, 2000),
        Math.round(b.price * 100),
        b.category,
        b.image || "",
        JSON.stringify(stock),
        b.active ? 1 : 0,
      );
      return reply({ ok: true });
    }
    if (b.action === "status") {
      if (s?.role !== "admin")
        return reply({ error: "Acceso restringido." }, 403);
      const transitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["shipped", "cancelled"],
        shipped: ["completed"],
        completed: [],
        cancelled: [],
      };
      db.exec("BEGIN IMMEDIATE");
      try {
        const order = db.prepare("SELECT * FROM orders WHERE id=?").get(b.id);
        if (!order || !transitions[order.status]?.includes(b.status))
          throw new Error("Cambio de estado no permitido.");
        if (
          b.status === "confirmed" ||
          (b.status === "cancelled" && order.status === "confirmed")
        ) {
          for (const item of JSON.parse(order.items)) {
            const row = db
              .prepare("SELECT * FROM products WHERE id=?")
              .get(item.id);
            if (!row) throw new Error("Producto inexistente.");
            const stock = JSON.parse(row.stock);
            if (
              b.status === "confirmed" &&
              (!row.active || (stock[item.size] || 0) < item.quantity)
            )
              throw new Error(
                "Stock insuficiente: " + item.name + " / " + item.size,
              );
            stock[item.size] =
              (stock[item.size] || 0) +
              (b.status === "confirmed" ? -item.quantity : item.quantity);
            db.prepare("UPDATE products SET stock=? WHERE id=?").run(
              JSON.stringify(stock),
              item.id,
            );
          }
        }
        db.prepare("UPDATE orders SET status=? WHERE id=?").run(b.status, b.id);
        db.exec("COMMIT");
        return reply({ ok: true });
      } catch (e) {
        db.exec("ROLLBACK");
        return reply({ error: e.message }, 409);
      }
    }
    if (b.action === "order") {
      if (
        !b.name?.trim() ||
        b.name.length > 100 ||
        !/^[+0-9 ()-]{10,25}$/.test(b.phone || "") ||
        !["pickup", "shipping"].includes(b.delivery) ||
        !Array.isArray(b.items) ||
        !b.items.length ||
        b.items.length > 50
      )
        return reply({ error: "Revisa tu nombre, teléfono y carrito." }, 400);
      const items = [],
        seen = new Set();
      let total = 0;
      for (const item of b.items) {
        const key = item.id + ":" + item.size;
        if (seen.has(key)) return reply({ error: "Producto duplicado." }, 400);
        seen.add(key);
        const row = db
          .prepare("SELECT * FROM products WHERE id=? AND active=1")
          .get(item.id);
        if (
          !row ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 99 ||
          (JSON.parse(row.stock)[item.size] || 0) < item.quantity
        )
          return reply(
            { error: "Revisa disponibilidad y cantidad de las prendas." },
            409,
          );
        total += row.price * item.quantity;
        items.push({
          id: row.id,
          name: row.name,
          size: item.size,
          quantity: item.quantity,
          price: row.price / 100,
        });
      }
      // Reuse a recent identical request when WhatsApp is reopened.
      const serialized = JSON.stringify(items);
      const recent = db
        .prepare(
          "SELECT * FROM orders WHERE user_id IS ? AND name=? AND phone=? AND delivery=? AND items=? AND status=? AND created>? ORDER BY created DESC LIMIT 1",
        )
        .get(
          s?.user_id || null,
          b.name.trim(),
          b.phone,
          b.delivery,
          serialized,
          "pending",
          new Date(Date.now() - 300000).toISOString(),
        );
      const id = recent?.id || randomUUID();
      if (!recent)
        db.prepare("INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)").run(
          id,
          s?.user_id || null,
          b.name.trim(),
          b.phone,
          b.delivery,
          serialized,
          total,
          "pending",
          new Date().toISOString(),
        );
      const message = `Hola, quiero confirmar el pedido #${id}.\nNombre: ${b.name.trim()}\nTeléfono: ${b.phone}\nEntrega: ${b.delivery === "pickup" ? "Recoger (coordinar punto)" : "Envío (cotizar)"}\n\n${items.map((i) => `${i.quantity} × ${i.name} / talla ${i.size} / $${i.price.toFixed(2)} MXN c/u`).join("\n")}\n\nSubtotal: $${(total / 100).toFixed(2)} MXN.\nEnvío por cotizar. Confirmar disponibilidad, entrega y forma de pago.`;
      return reply({
        id,
        url: "https://wa.me/528123408200?text=" + encodeURIComponent(message),
      });
    }
    return reply({ error: "Acción inválida." }, 400);
  } catch {
    return reply({ error: "No se pudo procesar la solicitud." }, 400);
  }
}
