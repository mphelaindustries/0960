import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { PRODUCTS, zar } from "@/lib/store";
import { TornEdge } from "@/components/site";
import { RotatingProduct } from "@/components/RotatingProduct";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELIM 0960 — Wear Your Story | Local Streetwear Tees" },
      { name: "description", content: "Graphic tees inspired by Elim, Mpheni, Waterval and surrounds. Simple. Clean. Unique. Order via WhatsApp." },
      { property: "og:title", content: "ELIM 0960 — Wear Your Story" },
      { property: "og:description", content: "Locally inspired graphic tees. Simple. Clean. Unique." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const p = PRODUCTS[0];
  if (!p) return null;
  return (
    <>
      {/* HERO */}
      <section className="shirt-hero grain relative overflow-hidden bg-ink text-ink-foreground">
        <div className="shirt-hero-scene"><RotatingProduct product={p} /></div>
        <div className="pointer-events-none relative mx-auto max-w-7xl px-5 pb-4 pt-10 md:pb-24 md:pt-16">
          <div className="pointer-events-auto max-w-sm md:max-w-md">
            <p className="font-hand text-2xl text-primary">Simple · Clean · Unique</p>
            <h1 className="mt-2 font-display text-7xl leading-[0.9] sm:text-8xl lg:text-[8rem]">
              ELIM<span className="text-primary">.</span><br />0960
            </h1>
            <p className="mt-3 font-hand text-2xl text-primary">Wear your story.</p>
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              More than a T-shirt. A connection to where you're from.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-auto rounded-sm px-6 py-3 text-sm font-bold uppercase tracking-widest"><Link to="/product/$slug" params={{ slug: p.slug }}>
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link></Button>
              <Button asChild variant="outline" className="h-auto rounded-sm border-ink-foreground bg-ink px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink-foreground"><Link to="/shop">
                View all
              </Link></Button>
            </div>
          </div>
        </div>
        <TornEdge className="absolute bottom-0 text-paper" />
      </section>

      {/* THE DROP */}
      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-6xl leading-none">THE ELIM COLLECTION</h2>
              <p className="mt-2 text-muted-foreground">Local identity. Distinctive design. More drops coming soon.</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-sm bg-secondary px-5 py-3 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((x) => (
              <ProductCard key={x.slug} slug={x.slug} />
            ))}
            {[1, 2, 3].map((i) => (
              <div key={i} className="hidden aspect-[4/5] place-items-center rounded-sm border-2 border-dashed border-border text-center sm:grid">
                <div>
                  <p className="font-display text-3xl text-muted-foreground">COMING SOON</p>
                  <p className="font-hand text-muted-foreground">Next drop</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRONT / BACK */}
      <section className="grain relative bg-ink text-ink-foreground">
        <TornEdge flip className="text-paper" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-6xl leading-[0.9] sm:text-7xl">
              ROOTED IN ELIM.
              <br />
              <span className="font-hand text-5xl text-primary">every detail tells a story</span>
            </h2>
            <p className="mt-6 max-w-md text-ink-muted">
              The 0960 mountain graphic on the front. The map of Mpheni, Waterval, Mabobo, Magulele, Shirley, Magangeni and Mbhokota on the back. Designed for those who want to wear a piece of home.
            </p>
            <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent">
              Order now <ShoppingCart className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { src: p.front, label: "Front design" },
              { src: p.back, label: "Back design" },
            ].map((im, i) => (
              <figure key={im.label} className={`border-4 border-ink-foreground bg-ink-foreground ${i ? "rotate-2" : "-rotate-2"}`}>
                <img src={im.src} alt={im.label} className="aspect-square w-full object-cover" />
                <figcaption className="bg-ink py-2 text-center font-display text-xl tracking-wide">{im.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductCard({ slug }: { slug: string }) {
   const x = PRODUCTS.find((p) => p.slug === slug);
   if (!x) return null;
  return (
    <Link to="/product/$slug" params={{ slug }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-card">
        <span className="absolute left-0 top-0 z-10 bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">New</span>
        <RotatingProduct product={x} compact />
      </div>
      <p className="mt-3 text-sm font-bold uppercase">{x.name}</p>
      <p className="font-bold">{zar(x.price)}</p>
      <p className="text-xs text-muted-foreground">{x.tagline}</p>
      <span className="mt-3 flex items-center justify-between rounded-sm bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground">
        View details <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
