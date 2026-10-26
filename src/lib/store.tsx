import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import front from "@/assets/tee-front.jpg.asset.json";
import back from "@/assets/tee-back.jpg.asset.json";

// Placeholder values — replace with the real price and WhatsApp number.
export const WHATSAPP_NUMBER = "27000000000";
export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export type Product = {
  slug: string;
  name: string;
  price: number;
  tagline: string;
  description: string;
  front: string;
  back: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "elim-map-graphic-tee",
    name: "Elim Map Graphic Tee",
    price: 350,
    tagline: "Black · Front & Back Print",
    description:
      "Mountain-inspired 0960 ELIM graphic on the front. A detailed map of Mpheni, Waterval, Shirley, Magangeni, Mbhokota and surrounds on the back. Wear your story.",
    front: front.url,
    back: back.url,
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const zar = (n: number) => `R${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

export type CartItem = { slug: string; size: string; qty: number };
type Ctx = {
  items: CartItem[];
  add: (i: CartItem) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  count: number;
  total: number;
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
  const total = items.reduce((a, i) => a + i.qty * (getProduct(i.slug)?.price ?? 0), 0);
  return (
    <CartCtx.Provider value={{ items, add, setQty, remove, clear: () => setItems([]), count, total }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

export type Customer = { name: string; phone: string; address: string; city: string; postal: string; notes: string };

export function buildWhatsAppMessage(items: CartItem[], c: Customer) {
  const lines = items.map((i) => {
    const p = getProduct(i.slug)!;
    return `• ${p.name} — Size ${i.size} × ${i.qty} = ${zar(p.price * i.qty)}`;
  });
  const total = items.reduce((a, i) => a + i.qty * (getProduct(i.slug)?.price ?? 0), 0);
  return [
    "Hi! I'd like to place an order:",
    "",
    ...lines,
    "",
    `Total: ${zar(total)}`,
    "",
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    `Delivery address: ${c.address}, ${c.city}, ${c.postal}`,
    c.notes ? `Notes: ${c.notes}` : "",
  ]
    .filter((l, idx, arr) => !(l === "" && idx === arr.length - 1))
    .join("\n");
}

export const whatsappUrl = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
