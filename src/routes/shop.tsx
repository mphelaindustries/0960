import { createFileRoute } from "@tanstack/react-router";
import { productsQuery, useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — ELIM 0960 Collection" },
      { name: "description", content: "Browse the ELIM 0960 graphic tee collection. Prices in ZAR." },
      { property: "og:title", content: "Shop — ELIM 0960 Collection" },
      { property: "og:description", content: "Browse locally inspired graphic tees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  errorComponent: () => <p className="py-24 text-center">Couldn't load the shop. Please refresh.</p>,
  component: Shop,
});

function Shop() {
  const products = useProducts();
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="font-display text-7xl leading-none">SHOP</h1>
      <p className="mt-2 text-muted-foreground">More designs coming soon.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
