import { zar } from "@/lib/store";
import type { Receipt } from "@/lib/types";

export const STATUS_LABEL: Record<string, string> = {
  new: "New",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function ReceiptView({ receipt, storeName = "ELIM 0960" }: { receipt: Receipt; storeName?: string }) {
  const o = receipt.order;
  return (
    <div className="print-area rounded-sm border border-border bg-card p-6 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-display text-3xl leading-none">{storeName}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Order receipt</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">Order #{o.order_number}</p>
          <p className="text-muted-foreground">{new Date(o.created_at).toLocaleString("en-ZA")}</p>
          <p className="mt-1 inline-block rounded-sm bg-secondary px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
            {STATUS_LABEL[o.status] ?? o.status}
          </p>
        </div>
      </div>
      <div className="grid gap-4 border-b border-border py-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer</p>
          <p>{o.customer_name}</p>
          <p>{o.phone}</p>
          {o.email && <p>{o.email}</p>}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deliver to</p>
          <p>{o.address}</p>
          <p>{[o.city, o.postal].filter(Boolean).join(", ")}</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <th className="py-2">Item</th>
            <th>Size</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((i) => (
            <tr key={i.id} className="border-t border-border">
              <td className="py-2">{i.product_name}</td>
              <td>{i.size}</td>
              <td className="text-right">{i.quantity}</td>
              <td className="text-right">{zar(i.unit_price)}</td>
              <td className="text-right">{zar(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{zar(o.subtotal)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{Number(o.delivery_fee) > 0 ? zar(o.delivery_fee) : "—"}</span></div>
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{zar(o.total)}</span></div>
      </div>
      {o.notes && <p className="mt-4 text-sm"><span className="font-bold">Notes:</span> {o.notes}</p>}
    </div>
  );
}
