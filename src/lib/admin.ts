import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderItemRow, OrderRow } from "./types";

export type AdminOrder = OrderRow & { order_items: OrderItemRow[] };

export const adminOrdersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async (): Promise<AdminOrder[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data as unknown as AdminOrder[];
  },
});

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_stock(size, quantity)")
      .order("sort_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return data;
  },
});

/** Revenue counts every order that wasn't cancelled. */
export function summarize(orders: Pick<OrderRow, "total" | "status">[]) {
  const counted = orders.filter((o) => o.status !== "cancelled");
  const revenue = counted.reduce((a, o) => a + Number(o.total), 0);
  return { revenue, orders: counted.length, average: counted.length ? revenue / counted.length : 0 };
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
