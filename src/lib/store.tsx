import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product, Receipt } from "./types";

export { SIZES } from "./types";
export type { Product } from "./types";

export const zar = (n: number) => `R${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

export type CartItem = { slug: string; size: string; qty: number };
type Ctx = {
  items: CartItem[];
  add: (i: CartItem) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  count: number;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "elim-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = (i: CartItem) =>
    setItems((prev) => {
      const ex = prev.find((p) => p.slug === i.slug && p.size === i.size);
      if (ex) return prev.map((p) => (p === ex ? { ...p, qty: Math.min(20, p.qty + i.qty) } : p));
      return [...prev, i];
    });
  const setQty = (slug: string, size: string, qty: number) =>
    setItems((prev) =>
      prev.map((p) => (p.slug === slug && p.size === size ? { ...p, qty: Math.max(1, Math.min(20, qty)) } : p)),
    );
  const remove = (slug: string, size: string) =>
    setItems((prev) => prev.filter((p) => !(p.slug === slug && p.size === size)));
  const count = items.reduce((a, i) => a + i.qty, 0);
  return (
    <CartCtx.Provider value={{ items, add, setQty, remove, clear: () => setItems([]), count }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

/** Cart lines joined with live product data; items for removed products are dropped. */
export function cartLines(items: CartItem[], products: Product[]) {
  return items.flatMap((i) => {
    const p = products.find((x) => x.slug === i.slug);
    return p ? [{ ...i, product: p, lineTotal: p.price * i.qty, available: p.stock[i.size] ?? 0 }] : [];
  });
}

export function cartTotals(items: CartItem[], products: Product[], deliveryFee: number) {
  const subtotal = cartLines(items, products).reduce((a, l) => a + l.lineTotal, 0);
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export function buildWhatsAppMessage(r: Receipt) {
  const o = r.order;
  return [
    `Hi! I'd like to confirm order #${o.order_number}:`,
    "",
    ...r.items.map((i) => `• ${i.product_name} — Size ${i.size} × ${i.quantity} = ${zar(i.line_total)}`),
    "",
    `Subtotal: ${zar(o.subtotal)}`,
    Number(o.delivery_fee) > 0 ? `Delivery: ${zar(o.delivery_fee)}` : "",
    `Total: ${zar(o.total)}`,
    "",
    `Name: ${o.customer_name}`,
    `Phone: ${o.phone}`,
    `Delivery address: ${[o.address, o.city, o.postal].filter(Boolean).join(", ")}`,
    o.notes ? `Notes: ${o.notes}` : "",
  ]
    .filter((l, idx, arr) => !(l === "" && (idx === arr.length - 1 || arr[idx - 1] === "")))
    .join("\n")
    .trim();
}

export const whatsappUrl = (number: string, msg: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
