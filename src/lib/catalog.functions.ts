import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Product, Receipt, StoreSettings } from "./types";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const { data, error } = await publicClient()
    .from("products")
    .select("id, slug, name, price, tagline, description, front_image, back_image, product_stock(size, quantity)")
    .eq("active", true)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error(error);
    throw new Error("Could not load products");
  }
  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    tagline: p.tagline,
    description: p.description,
    front: p.front_image,
    back: p.back_image,
    stock: Object.fromEntries(p.product_stock.map((s) => [s.size, s.quantity])),
  }));
});

export const getSettings = createServerFn({ method: "GET" }).handler(async (): Promise<StoreSettings> => {
  const { data } = await publicClient().from("store_settings").select("*").eq("id", 1).maybeSingle();
  return {
    store_name: data?.store_name ?? "ELIM 0960",
    whatsapp_number: data?.whatsapp_number ?? "27000000000",
    delivery_fee: Number(data?.delivery_fee ?? 0),
    contact_email: data?.contact_email ?? "",
  };
});

export const getReceipt = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.id)) throw new Error("Invalid order");
    return d;
  })
  .handler(async ({ data }): Promise<Receipt | null> => {
    const { data: r, error } = await publicClient().rpc("get_order_receipt", { p_id: data.id });
    if (error) {
      console.error(error);
      throw new Error("Could not load order");
    }
    return (r as unknown as Receipt) ?? null;
  });
