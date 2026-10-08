import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = mkdtempSync(join(tmpdir(), "outcast-test-"));
const base = "http://127.0.0.1:3198";
let server;
before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3198", "-H", "127.0.0.1"],
    {
      env: {
        ...process.env,
        ADMIN_PASSWORD: "test-admin-password-only",
        DATABASE_PATH: join(directory, "shop.sqlite"),
      },
      stdio: "pipe",
    },
  );
  let logs = "";
  server.stderr.on("data", (d) => (logs += d));
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base + "/api/shop");
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error(logs || "Server did not start");
});
after(async () => {
  server?.kill();
  if (server && server.exitCode === null) await new Promise((r) => server.once("exit", r));
  rmSync(directory, { recursive: true, force: true });
});
async function post(body, cookie = "", origin = base) {
  const r = await fetch(base + "/api/shop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
test("Permissions, server pricing, WhatsApp checkout, customer isolation and transactional stock", async () => {
  assert.equal(
    (await post({ action: "saveProduct", name: "Unauthorized" })).status,
    403,
  );
  assert.equal(
    (
      await post(
        { action: "adminLogin", password: "test-admin-password-only" },
        "",
        "https://evil.example",
      )
    ).status,
    403,
  );
  const login = await post({
    action: "adminLogin",
    password: "test-admin-password-only",
  });
  assert.equal(login.status, 200);
  const admin = login.cookie;
  const product = {
    action: "saveProduct",
    name: "Test Tee",
    description: "Test",
    price: 450,
    category: "oversize",
    image: "",
    stock: { M: 5, L: 0 },
    active: true,
  };
  assert.equal((await post(product, admin)).status, 200);
  const catalog = await (await fetch(base + "/api/shop")).json();
  const id = catalog[0].id;
  const registration = await post({
    action: "register",
    name: "Customer A",
    email: "a@example.com",
    password: "password-customer-a",
  });
  assert.equal(registration.status, 200);
  const customer = registration.cookie;
  const body = {
    action: "order",
    name: "A",
    phone: "8123408200",
    delivery: "pickup",
    items: [{ id, size: "M", quantity: 3, price: 1 }],
  };
  const order = await post(body, customer);
  assert.equal(order.status, 200);
  assert.ok(order.data.url.startsWith("https://wa.me/528123408200?text="));
  assert.ok(decodeURIComponent(order.data.url).includes("1350.00"));
  assert.equal((await post(body, customer)).data.id, order.data.id);
  assert.equal(
    (await post({ ...body, items: [{ id, size: "L", quantity: 1 }] }, customer))
      .status,
    409,
  );
  assert.equal(
    (
      await post(
        { action: "status", id: order.data.id, status: "confirmed" },
        customer,
      )
    ).status,
    403,
  );
  const second = await post({
    ...body,
    name: "B",
    items: [{ id, size: "M", quantity: 4 }],
  });
  assert.equal(second.status, 200);
  assert.equal(
    (
      await post(
        { action: "status", id: order.data.id, status: "confirmed" },
        admin,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await post(
        { action: "status", id: order.data.id, status: "confirmed" },
        admin,
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await post(
        { action: "status", id: second.data.id, status: "confirmed" },
        admin,
      )
    ).status,
    409,
  );
  const stocks = await (await fetch(base + "/api/shop")).json();
  assert.equal(stocks[0].stock.M, 2);
  const customerOrders = await (
    await fetch(base + "/api/shop?kind=orders", {
      headers: { Cookie: customer },
    })
  ).json();
  assert.equal(customerOrders.length, 1);
  assert.equal(customerOrders[0].total, 1350);
  const other = await post({
    action: "register",
    name: "Customer B",
    email: "b@example.com",
    password: "password-customer-b",
  });
  const otherOrders = await (
    await fetch(base + "/api/shop?kind=orders", {
      headers: { Cookie: other.cookie },
    })
  ).json();
  assert.equal(otherOrders.length, 0);
  assert.equal(
    (
      await post(
        { action: "status", id: order.data.id, status: "cancelled" },
        admin,
      )
    ).status,
    200,
  );
  assert.equal((await (await fetch(base + "/api/shop")).json())[0].stock.M, 5);
  for (const route of [
    "/",
    "/productos",
    "/oversize",
    "/nosotros",
    "/cuenta",
    "/admin",
    "/carrito",
  ])
    assert.equal((await fetch(base + route)).status, 200);
});
