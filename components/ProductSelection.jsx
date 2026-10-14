"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { cartLimit, sizes } from "../lib/catalog";
export default function ProductSelection({ product }) {
  const { cart, ready, addToCart } = useCart();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const already =
    cart.find((i) => i.id === product.id && i.size === size)?.quantity || 0;
  const remaining = Math.max(0, cartLimit(product, size) - already);
  return (
    <div>
      <fieldset>
        <legend>Elige tu talla</legend>
        <div className="size-buttons">
          {sizes
            .filter((s) => s in product.stock)
            .map((s) => (
              <button
                type="button"
                key={s}
                disabled={!product.stock[s]}
                aria-pressed={size === s}
                onClick={() => {
                  setSize(s);
                  setQuantity(1);
                  setMessage("");
                }}
              >
                {s}
              </button>
            ))}
        </div>
      </fieldset>
      {size && (
        <p className="muted">
          {remaining
            ? `${remaining} disponibles para añadir`
            : "Ya tienes en tu bolsa todas las unidades disponibles de esta talla."}
        </p>
      )}
      <label>
        Cantidad
        <input
          type="number"
          min="1"
          max={remaining || 1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>
      <button
        className="button"
        disabled={
          !ready ||
          !size ||
          remaining < 1 ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > remaining
        }
        onClick={() => {
          addToCart(product, size, quantity);
          setMessage("Prenda añadida a tu bolsa.");
        }}
      >
        Añadir a la bolsa
      </button>
      <p role="status">{message}</p>
      {message && <Link href="/carrito">Ir a mi bolsa ↗</Link>}
    </div>
  );
}
