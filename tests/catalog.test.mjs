import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProducts, cartLimit } from "../lib/catalog.js";
const products = [
  {
    id: "a",
    name: "Shadow",
    description: "Estampado rojo",
    category: "oversize",
    price: 450,
    stock: { M: 2, L: 0 },
  },
  {
    id: "b",
    name: "Basic",
    description: "Algodón",
    category: "clasica",
    price: 300,
    stock: { M: 0, L: 4 },
  },
  {
    id: "c",
    name: "Hood",
    description: "Negro",
    category: "hoodie",
    price: 650,
    stock: { M: 0 },
  },
];
test("Combined filters exclude unavailable sizes and search descriptions", () => {
  assert.deepEqual(
    filterProducts(products, {
      category: "oversize",
      size: "M",
      search: " ROJO ",
      available: true,
    }).map((p) => p.id),
    ["a"],
  );
  assert.deepEqual(
    filterProducts(products, { size: "L" }).map((p) => p.id),
    ["b"],
  );
  assert.equal(filterProducts(products, { available: true }).length, 2);
  assert.deepEqual(
    filterProducts(products, { sort: "price-desc" }).map((p) => p.id),
    ["c", "a", "b"],
  );
  assert.equal(products[0].id, "a");
});
test("Missing and sold-out sizes cannot be added", () => {
  assert.equal(cartLimit(products[0], "L"), 0);
  assert.equal(cartLimit(products[0], "XS"), 0);
  assert.equal(cartLimit(products[0], "M"), 2);
  assert.equal(cartLimit({ stock: { M: 120 } }, "M"), 99);
});
