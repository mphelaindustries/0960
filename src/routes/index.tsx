import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { PRODUCTS, zar } from "@/lib/store";
import { TornEdge } from "@/components/site";
import poster from "@/assets/poster.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELIM 0960 — Wear Your Story | Local Streetwear Tees" },
      { name: "description", content: "Graphic tees inspired by Elim, Mpheni, Waterval and surrounds. Simple. Clean. Unique. Order via WhatsApp." },
      { property: "og:title", content: "ELIM 0960 — Wear Your Story" },
      { property: "og:description", content: "Locally inspired graphic tees. Simple. Clean. Unique." },
    ],
  }),
  component: Home,
});

function Home() {
  const p = PRODUCTS[0];
  return (
    <>
      {/* HERO */}
      <section className="grain relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:pb-24">
          <div>
            <p className="font-hand text-2xl text-primary">Simple · Clean · Unique</p>
            <h1 className="mt-2 font-display text-7xl leading-[0.85] sm:text-8xl lg:text-[9rem]">
              WEAR
              <br />
              <span className="brush inline-block text-primary-foreground">YOUR</span>
              <br />
              STORY.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              More than a T-shirt. A connection to where you're from.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/product/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-sm border border-ink-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest hover:border-primary hover:text-primary">
                View all
              </Link>
            </div>
          </div>
          <div className="relative">
            <img src={poster.url} alt="Elim T-shirt collection — front and back designs" className="mx-auto w-full max-w-md -rotate-2 border-4 border-ink-foreground shadow-2xl" />
            <span className="absolute -right-2 top-6 rotate-3 bg-primary px-3 py-2 font-display text-xl leading-none text-primary-foreground md:-right-6">
              FRONT &amp; BACK
              <br />
              PRINT
            </span>
            <span className="absolute -left-2 bottom-10 -rotate-3 bg-ink-foreground px-3 py-2 font-display text-xl leading-none text-ink md:-left-6">
              SUPPORT
              <br />
              LOCAL
            </span>
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
  const x = PRODUCTS.find((p) => p.slug === slug)!;
  return (
    <Link to="/product/$slug" params={{ slug }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-card">
        <span className="absolute left-0 top-0 z-10 bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">New</span>
        <img src={x.front} alt={x.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:opacity-0" />
        <img src={x.back} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />
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
