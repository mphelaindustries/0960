import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/store";
import { ProductCard } from "./index";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — ELIM 0960 Collection" },
      { name: "description", content: "Browse the ELIM 0960 graphic tee collection. Prices in ZAR." },
      { property: "og:title", content: "Shop — ELIM 0960 Collection" },
      { property: "og:description", content: "Browse locally inspired graphic tees." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="font-display text-7xl leading-none">SHOP</h1>
      <p className="mt-2 text-muted-foreground">One design for now — more coming soon.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.slug} slug={p.slug} />
        ))}
      </div>
    </section>
  ),
});
