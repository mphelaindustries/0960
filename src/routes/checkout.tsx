import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppMessage, getProduct, useCart, whatsappUrl, zar, type Customer } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ELIM 0960" },
      { name: "description", content: "Enter your delivery details and send your order via WhatsApp." },
      { property: "og:title", content: "Checkout — ELIM 0960" },
      { property: "og:description", content: "Order via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^[+0-9 ()-]{9,20}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your town / city").max(80),
  postal: z.string().trim().regex(/^[0-9]{4}$/, "4-digit postal code"),
  notes: z.string().trim().max(300),
});

const FIELDS: { k: keyof Customer; label: string; area?: boolean }[] = [
  { k: "name", label: "Full name" },
  { k: "phone", label: "Phone number" },
  { k: "address", label: "Street address" },
  { k: "city", label: "Town / city" },
  { k: "postal", label: "Postal code" },
  { k: "notes", label: "Notes (optional)", area: true },
];

function Checkout() {
  const { items, total } = useCart();
  const [f, setF] = useState<Customer>({ name: "", phone: "", address: "", city: "", postal: "", notes: "" });
  const [errs, setErrs] = useState<Partial<Record<keyof Customer, string>>>({});

  if (!items.length)
    return (
      <div className="py-24 text-center">
        <p className="font-display text-5xl">NOTHING TO CHECK OUT</p>
        <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
      </div>
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const out: Partial<Record<keyof Customer, string>> = {};
      r.error.issues.forEach((i) => (out[i.path[0] as keyof Customer] = i.message));
      return setErrs(out);
    }
    setErrs({});
    window.open(whatsappUrl(buildWhatsAppMessage(items, r.data)), "_blank", "noopener");
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} noValidate>
        <h1 className="font-display text-6xl">CHECKOUT</h1>
        <p className="text-muted-foreground">Fill in your details — we'll open WhatsApp with your order ready to send.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ k, label, area }) => (
            <label key={k} className={k === "address" || area ? "sm:col-span-2" : ""}>
              <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
              {area ? (
                <textarea value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} rows={3} className="mt-1 w-full rounded-sm border border-input bg-card px-3 py-2" />
              ) : (
                <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full rounded-sm border border-input bg-card px-3 py-3" />
              )}
              {errs[k] && <span className="text-sm text-destructive">{errs[k]}</span>}
            </label>
          ))}
        </div>
        <button type="submit" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-success py-4 text-sm font-bold uppercase tracking-widest text-ink-foreground sm:w-auto sm:px-10">
          <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
        </button>
      </form>
      <aside className="h-fit rounded-sm bg-ink p-6 text-ink-foreground">
        <p className="font-display text-3xl">YOUR ORDER</p>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <li key={i.slug + i.size} className="flex justify-between gap-2">
                <span>{p.name} · {i.size} × {i.qty}</span>
                <span>{zar(p.price * i.qty)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold"><span>Total</span><span>{zar(total)}</span></div>
        <p className="mt-2 text-xs text-ink-muted">Payment and delivery fee are confirmed with you on WhatsApp.</p>
      </aside>
    </section>
  );
}
