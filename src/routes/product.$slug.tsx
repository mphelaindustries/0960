import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SIZES, useCart, zar } from "@/lib/store";
import { productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(productsQuery);
    const p = products.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — ELIM 0960` : "Product unavailable — ELIM 0960" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.name ?? "ELIM 0960" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <p className="py-24 text-center">Couldn't load this product. Please refresh.</p>,
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-display text-5xl">PRODUCT NOT FOUND</p>
      <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const p = useSuspenseQuery(productsQuery).data.find((x) => x.slug === slug)!;
  const { add, items } = useCart();
  const nav = useNavigate();
  const [view, setView] = useState<"front" | "back">("front");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");

  const inCart = (s: string) => items.find((i) => i.slug === p.slug && i.size === s)?.qty ?? 0;
  const left = size ? (p.stock[size] ?? 0) - inCart(size) : 20;
  const maxQty = Math.max(1, Math.min(20, left));

  const addToCart = (go: boolean) => {
    if (!size) return setErr("Please choose a size.");
    if (left < qty) return setErr(left > 0 ? `Only ${left} left in size ${size}.` : `Size ${size} is sold out.`);
    add({ slug: p.slug, size, qty });
    if (go) nav({ to: "/cart" });
    else setErr("");
  };
  const images = { front: p.front, back: p.back || p.front };

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-sm bg-card">
          <img src={images[view]} alt={`${p.name} ${view}`} className="aspect-square w-full object-cover" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(["front", "back"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`overflow-hidden rounded-sm border-2 ${view === v ? "border-primary" : "border-transparent"}`}>
              <img src={images[v]} alt={`${v} view`} className="aspect-square w-full object-cover" />
              <span className="block bg-secondary py-1 text-xs font-bold uppercase tracking-widest text-secondary-foreground">{v} design</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-hand text-xl text-accent">Wear your story</p>
        <h1 className="font-display text-6xl leading-none">{p.name}</h1>
        <p className="mt-3 text-3xl font-bold">{zar(p.price)}</p>
        <p className="text-sm text-muted-foreground">{p.tagline}</p>
        <p className="mt-6 leading-relaxed">{p.description}</p>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const out = (p.stock[s] ?? 0) <= 0;
            return (
              <button
                key={s}
                disabled={out}
                title={out ? "Sold out" : undefined}
                onClick={() => { setSize(s); setErr(""); setQty(1); }}
                className={`h-12 w-14 rounded-sm border-2 font-bold disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${size === s ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card hover:border-secondary"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {size && left > 0 && left <= 5 && <p className="mt-2 text-sm font-bold text-accent">Only {left} left in size {size}</p>}
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}

        <p className="mt-6 text-xs font-bold uppercase tracking-widest">Quantity</p>
        <div className="mt-2 inline-flex items-center rounded-sm border-2 border-border bg-card">
          <button aria-label="Decrease" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button aria-label="Increase" className="p-3" onClick={() => setQty(Math.min(maxQty, qty + 1))}><Plus className="h-4 w-4" /></button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => addToCart(false)} className="flex-1 rounded-sm border-2 border-secondary px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-secondary hover:text-secondary-foreground">
            Add to cart
          </button>
          <button onClick={() => addToCart(true)} className="flex-1 rounded-sm bg-primary px-6 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent">
            Buy now
          </button>
        </div>
      </div>
    </section>
  );
}
