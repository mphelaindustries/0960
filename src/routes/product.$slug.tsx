import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { getProduct, SIZES, useCart, zar } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — ELIM 0960` : "Product not found" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.name ?? "ELIM 0960" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "product" },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-display text-5xl">PRODUCT NOT FOUND</p>
      <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const { add } = useCart();
  const nav = useNavigate();
  const [view, setView] = useState<"front" | "back">("front");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);

  const addToCart = (go: boolean) => {
    if (!size) return setErr(true);
    add({ slug: p.slug, size, qty });
    if (go) nav({ to: "/cart" });
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-sm bg-card">
          <img src={view === "front" ? p.front : p.back} alt={`${p.name} ${view}`} className="aspect-square w-full object-cover" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(["front", "back"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`overflow-hidden rounded-sm border-2 ${view === v ? "border-primary" : "border-transparent"}`}>
              <img src={v === "front" ? p.front : p.back} alt={`${v} view`} className="aspect-square w-full object-cover" />
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
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setSize(s); setErr(false); }}
              className={`h-12 w-14 rounded-sm border-2 font-bold ${size === s ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card hover:border-secondary"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {err && <p className="mt-2 text-sm text-destructive">Please choose a size.</p>}

        <p className="mt-6 text-xs font-bold uppercase tracking-widest">Quantity</p>
        <div className="mt-2 inline-flex items-center rounded-sm border-2 border-border bg-card">
          <button aria-label="Decrease" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button aria-label="Increase" className="p-3" onClick={() => setQty(Math.min(20, qty + 1))}><Plus className="h-4 w-4" /></button>
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
