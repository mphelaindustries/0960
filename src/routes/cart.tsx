import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getProduct, useCart, zar } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ELIM 0960" },
      { name: "description", content: "Review your ELIM 0960 order before checkout." },
      { property: "og:title", content: "Your Cart — ELIM 0960" },
      { property: "og:description", content: "Review your order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();
  if (!items.length)
    return (
      <div className="px-5 py-24 text-center">
        <p className="font-display text-6xl">YOUR CART IS EMPTY</p>
        <Link to="/shop" className="mt-6 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground">Shop now</Link>
      </div>
    );
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-6xl">YOUR CART</h1>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <li key={i.slug + i.size} className="flex gap-4 py-5">
                <img src={p.front} alt={p.name} className="h-24 w-24 shrink-0 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold uppercase">{p.name}</p>
                  <p className="text-sm text-muted-foreground">Size {i.size} · {zar(p.price)}</p>
                  <div className="mt-3 inline-flex items-center rounded-sm border border-border bg-card">
                    <button aria-label="Decrease" className="p-2" onClick={() => setQty(i.slug, i.size, i.qty - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-bold">{i.qty}</span>
                    <button aria-label="Increase" className="p-2" onClick={() => setQty(i.slug, i.size, i.qty + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold">{zar(p.price * i.qty)}</p>
                  <button aria-label="Remove" onClick={() => remove(i.slug, i.size)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-sm bg-ink p-6 text-ink-foreground">
        <p className="font-display text-3xl">ORDER SUMMARY</p>
        <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{zar(total)}</span></div>
        <div className="mt-2 flex justify-between text-sm text-ink-muted"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold"><span>Total</span><span>{zar(total)}</span></div>
        <Link to="/checkout" className="mt-6 block rounded-sm bg-primary py-4 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent">Checkout</Link>
      </aside>
    </section>
  );
}
