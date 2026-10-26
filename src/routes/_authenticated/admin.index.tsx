import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminOrdersQuery, adminProductsQuery, summarize } from "@/lib/admin";
import { zar } from "@/lib/store";
import { STATUS_LABEL } from "@/components/receipt";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-5xl leading-none">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Overview() {
  const orders = useQuery(adminOrdersQuery);
  const products = useQuery(adminProductsQuery);
  if (orders.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (orders.error) return <p className="text-destructive">Couldn't load orders.</p>;
  const all = orders.data ?? [];
  const s = summarize(all);
  const since = Date.now() - 30 * 864e5;
  const month = summarize(all.filter((o) => new Date(o.created_at).getTime() >= since));
  const pending = all.filter((o) => o.status === "new").length;

  const best = new Map<string, { qty: number; revenue: number }>();
  all.filter((o) => o.status !== "cancelled").forEach((o) =>
    o.order_items.forEach((i) => {
      const b = best.get(i.product_name) ?? { qty: 0, revenue: 0 };
      best.set(i.product_name, { qty: b.qty + i.quantity, revenue: b.revenue + Number(i.line_total) });
    }),
  );
  const lowStock = (products.data ?? []).flatMap((p) =>
    p.product_stock.filter((st) => st.quantity <= 3).map((st) => ({ name: p.name, size: st.size, qty: st.quantity })),
  );

  return (
    <div>
      <h1 className="font-display text-6xl leading-none">OVERVIEW</h1>
      <p className="mt-1 text-muted-foreground">Cancelled orders aren't counted in revenue.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total revenue" value={zar(s.revenue)} />
        <Stat label="Last 30 days" value={zar(month.revenue)} hint={`${month.orders} orders`} />
        <Stat label="Orders" value={String(s.orders)} hint={`Avg ${zar(s.average)}`} />
        <Stat label="Waiting on you" value={String(pending)} hint="New orders" />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-end justify-between">
            <p className="font-display text-3xl">RECENT ORDERS</p>
            <Link to="/admin/orders" className="text-sm underline">All orders</Link>
          </div>
          {all.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-sm border border-border bg-card">
              {all.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div>
                    <p className="font-bold">#{o.order_number} · {o.customer_name}</p>
                    <p className="text-muted-foreground">{new Date(o.created_at).toLocaleString("en-ZA")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{zar(o.total)}</p>
                    <p className="text-xs uppercase tracking-widest">{STATUS_LABEL[o.status]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-8">
          <div>
            <p className="font-display text-3xl">BEST SELLERS</p>
            {best.size === 0 ? (
              <p className="mt-2 text-muted-foreground">Nothing sold yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {[...best.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5).map(([name, b]) => (
                  <li key={name} className="flex justify-between rounded-sm border border-border bg-card px-4 py-3 text-sm">
                    <span className="font-bold">{name}</span>
                    <span>{b.qty} sold · {zar(b.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-display text-3xl">LOW STOCK</p>
            {lowStock.length === 0 ? (
              <p className="mt-2 text-muted-foreground">All sizes are well stocked.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {lowStock.map((l) => (
                  <li key={l.name + l.size} className="flex justify-between rounded-sm border border-border bg-card px-4 py-3 text-sm">
                    <span>{l.name} · {l.size}</span>
                    <span className={l.qty === 0 ? "font-bold text-destructive" : "font-bold"}>{l.qty === 0 ? "Sold out" : `${l.qty} left`}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/products" className="mt-3 inline-block text-sm underline">Update stock</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
