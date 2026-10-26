import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminOrdersQuery } from "@/lib/admin";
import { zar } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/admin/customers")({ component: Customers });

function Customers() {
  const q = useQuery(adminOrdersQuery);
  const map = new Map<string, { name: string; phone: string; email: string | null; city: string; orders: number; spent: number; last: string; account: boolean }>();
  (q.data ?? []).forEach((o) => {
    const key = o.phone.replace(/\D/g, "");
    const c = map.get(key);
    const spent = o.status === "cancelled" ? 0 : Number(o.total);
    if (!c) map.set(key, { name: o.customer_name, phone: o.phone, email: o.email, city: o.city, orders: 1, spent, last: o.created_at, account: !!o.user_id });
    else map.set(key, { ...c, orders: c.orders + 1, spent: c.spent + spent, account: c.account || !!o.user_id, email: c.email ?? o.email });
  });
  const list = [...map.values()].sort((a, b) => b.spent - a.spent);
  return (
    <div>
      <h1 className="font-display text-6xl leading-none">CUSTOMERS</h1>
      <p className="mt-1 text-muted-foreground">Everyone who has placed an order, grouped by phone number.</p>
      {q.isLoading ? <p className="mt-6 text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No customers yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="p-3">Name</th><th>Contact</th><th>Town</th><th>Orders</th><th className="text-right">Spent</th><th className="p-3">Last order</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.phone} className="border-t border-border">
                  <td className="p-3 font-bold">{c.name}{c.account && <span className="ml-2 text-xs font-normal text-muted-foreground">(account)</span>}</td>
                  <td>{c.phone}{c.email && <><br /><span className="text-muted-foreground">{c.email}</span></>}</td>
                  <td>{c.city}</td>
                  <td>{c.orders}</td>
                  <td className="text-right font-bold">{zar(c.spent)}</td>
                  <td className="p-3">{new Date(c.last).toLocaleDateString("en-ZA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
