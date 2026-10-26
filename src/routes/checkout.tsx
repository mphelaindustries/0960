import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { buildWhatsAppMessage, cartLines, cartTotals, useCart, whatsappUrl, zar } from "@/lib/store";
import { productsQuery, settingsQuery, useProducts, useSettings } from "@/lib/catalog";
import { getReceipt } from "@/lib/catalog.functions";

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
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(productsQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  errorComponent: () => <p className="py-24 text-center">Couldn't load checkout. Please refresh.</p>,
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^[+0-9 ()-]{9,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your town / city").max(80),
  postal: z.string().trim().regex(/^[0-9]{4}$/, "4-digit postal code"),
  notes: z.string().trim().max(300),
});
type Form = z.infer<typeof schema>;

const FIELDS: { k: keyof Form; label: string; area?: boolean; wide?: boolean }[] = [
  { k: "name", label: "Full name" },
  { k: "phone", label: "Phone number" },
  { k: "email", label: "Email (optional)", wide: true },
  { k: "address", label: "Street address", wide: true },
  { k: "city", label: "Town / city" },
  { k: "postal", label: "Postal code" },
  { k: "notes", label: "Notes (optional)", area: true, wide: true },
];

function Checkout() {
  const { items, clear } = useCart();
  const products = useProducts();
  const settings = useSettings();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState<Form>({ name: "", phone: "", email: "", address: "", city: "", postal: "", notes: "" });
  const [errs, setErrs] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setF((cur) => ({
        ...cur,
        name: cur.name || data.full_name,
        phone: cur.phone || data.phone,
        email: cur.email || data.email || "",
        address: cur.address || data.address,
        city: cur.city || data.city,
        postal: cur.postal || data.postal,
      }));
    });
  }, [user]);

  const lines = cartLines(items, products);
  const t = cartTotals(items, products, settings.delivery_fee);

  if (!lines.length)
    return (
      <div className="py-24 text-center">
        <p className="font-display text-5xl">NOTHING TO CHECK OUT</p>
        <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const out: Partial<Record<keyof Form, string>> = {};
      r.error.issues.forEach((i) => (out[i.path[0] as keyof Form] = i.message));
      return setErrs(out);
    }
    setErrs({});
    setFormErr("");
    setBusy(true);
    // Open the WhatsApp tab right away so the browser doesn't block it.
    const win = window.open("about:blank", "_blank");
    const { data, error } = await supabase.rpc("place_order", {
      p_items: lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })),
      p_customer: r.data,
    });
    if (error || !data) {
      win?.close();
      setBusy(false);
      setFormErr(error?.message ?? "Couldn't place your order. Please try again.");
      qc.invalidateQueries({ queryKey: ["products"] });
      return;
    }
    const placed = data as { id: string };
    const receipt = await getReceipt({ data: { id: placed.id } });
    if (receipt && win) win.location.href = whatsappUrl(settings.whatsapp_number, buildWhatsAppMessage(receipt));
    clear();
    qc.invalidateQueries({ queryKey: ["products"] });
    nav({ to: "/order/$id", params: { id: placed.id } });
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} noValidate>
        <h1 className="font-display text-6xl">CHECKOUT</h1>
        <p className="text-muted-foreground">
          Fill in your details — we'll save your order and open WhatsApp with it ready to send.
          {!user && (
            <> <Link to="/auth" className="underline">Sign in</Link> to save your details for next time.</>
          )}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ k, label, area, wide }) => (
            <label key={k} className={wide ? "sm:col-span-2" : ""}>
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
        {formErr && <p className="mt-4 rounded-sm border border-destructive p-3 text-sm text-destructive">{formErr}</p>}
        <button type="submit" disabled={busy} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-success py-4 text-sm font-bold uppercase tracking-widest text-ink-foreground disabled:opacity-60 sm:w-auto sm:px-10">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />} Place order on WhatsApp
        </button>
      </form>
      <aside className="h-fit rounded-sm bg-ink p-6 text-ink-foreground">
        <p className="font-display text-3xl">YOUR ORDER</p>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.slug + l.size} className="flex justify-between gap-2">
              <span>{l.product.name} · {l.size} × {l.qty}</span>
              <span>{zar(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        {t.deliveryFee > 0 && (
          <div className="mt-4 flex justify-between text-sm"><span>Delivery</span><span>{zar(t.deliveryFee)}</span></div>
        )}
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold"><span>Total</span><span>{zar(t.total)}</span></div>
        <p className="mt-2 text-xs text-ink-muted">Payment is arranged with you on WhatsApp.</p>
      </aside>
    </section>
  );
}
