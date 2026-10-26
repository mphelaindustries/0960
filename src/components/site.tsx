import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Shirt, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/cart", label: "Cart" },
] as const;

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-ink py-2 text-center text-[11px] tracking-[0.25em] text-ink-foreground/80">
        LOCAL CULTURE. ORIGINAL DESIGN. <span className="text-primary">WEAR YOUR STORY.</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/95 text-ink-foreground backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:grid-cols-3">
          <Link to="/" className="font-display text-3xl leading-none tracking-wide">
            ELIM<span className="text-primary">.</span>
            <span className="ml-2 align-middle font-body text-[10px] tracking-[0.3em] text-ink-muted">0960</span>
          </Link>
          <nav className="hidden justify-center gap-8 text-xs font-semibold tracking-[0.2em] md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="uppercase hover:text-primary">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-4">
            <Link to="/cart" aria-label="Cart" className="relative">
              <ShoppingBag className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 border-t border-line px-5 py-5 md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display text-2xl tracking-wide">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const items = [
    { icon: Shirt, t: "Original Designs", d: "Inspired by Elim & surrounds" },
    { icon: MessageCircle, t: "Order on WhatsApp", d: "Quick, personal checkout" },
    { icon: Truck, t: "Local Delivery", d: "Arranged with you directly" },
    { icon: ShieldCheck, t: "Support Local", d: "Made for our community" },
  ];
  return (
    <footer className="border-t border-line bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink-foreground/40">
              <I className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">{t}</p>
              <p className="text-xs text-ink-muted">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-4 text-center text-[11px] tracking-widest text-ink-muted">
        © {new Date().getFullYear()} ELIM 0960 · WEAR YOUR STORY
      </div>
    </footer>
  );
}

export function TornEdge({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className={`block h-6 w-full md:h-10 ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M0 40 L0 18 L40 24 L70 10 L110 22 L150 8 L200 20 L240 12 L290 26 L330 6 L380 18 L420 14 L470 28 L520 10 L560 22 L610 4 L660 20 L700 12 L750 26 L800 8 L850 22 L890 14 L940 28 L990 10 L1040 20 L1080 6 L1130 22 L1170 12 L1200 20 L1200 40 Z"
      />
    </svg>
  );
}
