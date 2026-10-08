import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
const path = resolve(
  /* turbopackIgnore: true */ process.env.DATABASE_PATH || "data/shop.sqlite",
);
mkdirSync(dirname(path), { recursive: true });
const db = new DatabaseSync(path);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, name TEXT, hash TEXT);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT, role TEXT, expires INTEGER);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, description TEXT, price INTEGER, category TEXT, image TEXT, stock TEXT, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, phone TEXT, delivery TEXT, items TEXT, total INTEGER, status TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER, until INTEGER);`);
export default db;
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password, hash) {
  const [salt, value] = hash.split(":");
  const expected = Buffer.from(value, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function product(row) {
  return {
    ...row,
    price: row.price / 100,
    stock: JSON.parse(row.stock),
    active: Boolean(row.active),
  };
}
