"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { cartLimit } from "../lib/catalog";
const Context = createContext();
const subscribe = () => () => {};
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      let saved = [];
      try {
        const data = JSON.parse(localStorage.getItem("outcast_cart") || "[]");
        if (Array.isArray(data))
          saved = data.filter(
            (i) =>
              typeof i.id === "string" &&
              typeof i.name === "string" &&
              typeof i.size === "string" &&
              Number.isFinite(i.price) &&
              i.price > 0 &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 99,
          );
      } catch {}
      setCart(saved);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("outcast_cart", JSON.stringify(cart));
      } catch {}
  }, [cart, ready]);
  const addToCart = (p, size, quantity = 1) => {
    if (
      !size ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      cartLimit(p, size) < 1
    )
      return;
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id && i.size === size);
      const limit = cartLimit(p, size);
      return found
        ? prev.map((i) =>
            i === found
              ? { ...i, quantity: Math.min(limit, i.quantity + quantity) }
              : i,
          )
        : [
            ...prev,
            {
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image,
              size,
              quantity: Math.min(limit, quantity),
            },
          ];
    });
  };
  const removeFromCart = (id, size) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  const updateQuantity = (id, size, n) => {
    if (!Number.isInteger(n) || n > 99) return;
    if (n <= 0) return removeFromCart(id, size);
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: n } : i,
      ),
    );
  };
  return (
    <Context.Provider
      value={{
        cart,
        ready: ready && hydrated,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: () => setCart([]),
        totalItems: cart.reduce((s, i) => s + i.quantity, 0),
        totalPrice: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  return useContext(Context);
}
