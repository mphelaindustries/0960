import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { zar } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ProductCard({ product: x }: { product: Product }) {
  const soldOut = Object.values(x.stock).every((q) => q <= 0);
  return (
    <Link to="/product/$slug" params={{ slug: x.slug }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-card">
        <span className="absolute left-0 top-0 z-10 bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">
          {soldOut ? "Sold out" : "New"}
        </span>
        <img src={x.front} alt={x.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:opacity-0" />
        <img src={x.back || x.front} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />
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
