import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminOrdersQuery, type AdminOrder } from "@/lib/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { zar } from "@/lib/store";
import { ReceiptView, STATUS_LABEL } from "@/components/receipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: Orders });

function Orders() {
  const q = useQuery(adminOrdersQuery);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const all = q.data ?? [];
  const list = filter === "all" ? all : all.filter((o) => o.status === filter);
  const open = all.find((o) => o.id === openId);

  const setStatus = async (o: AdminOrder, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    if (error) return toast.error("Couldn't update order");
    toast.success(`Order #${o.order_number} marked ${STATUS_LABEL[status]}`);
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <h1 className="font-display text-6xl leading-none">ORDERS</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...ORDER_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-widest ${filter === s ? "bg-secondary text-secondary-foreground" : "border border-border bg-card"}`}>
            {s === "all" ? "All" : STATUS_LABEL[s]} ({s === "all" ? all.length : all.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      {q.isLoading ? <p className="mt-6 text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No orders here yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="p-3">Order</th><th>Date</th><th>Customer</th><th>Items</th><th className="text-right">Total</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer border-t border-border hover:bg-muted">
                  <td className="p-3 font-bold">#{o.order_number}</td>
                  <td>{new Date(o.created_at).toLocaleDateString("en-ZA")}</td>
                  <td>{o.customer_name}<br /><span className="text-muted-foreground">{o.phone}</span></td>
                  <td>{o.order_items.reduce((a, i) => a + i.quantity, 0)}</td>
                  <td className="text-right font-bold">{zar(o.total)}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} onChange={(e) => setStatus(o, e.target.value as OrderStatus)} className="rounded-sm border border-input bg-card px-2 py-1">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
          {open && (
            <>
              <ReceiptView receipt={{ order: open, items: open.order_items }} />
              <div className="flex flex-wrap gap-3">
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-sm border-2 border-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  <Printer className="h-4 w-4" /> Print
                </button>
                <a href={`https://wa.me/${open.phone.replace(/\D/g, "").replace(/^0/, "27")}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-success px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink-foreground">
                  <MessageCircle className="h-4 w-4" /> Message customer
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
