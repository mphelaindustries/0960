import { describe, expect, it } from "vitest";
import { cartTotals } from "@/lib/store";
import { summarize } from "@/lib/admin";
import type { Product } from "@/lib/types";

const tee: Product = { id: "1", slug: "tee", name: "Tee", price: 350, tagline: "", description: "", front: "", back: "", stock: { M: 2 } };

describe("store rules", () => {
  it("adds the delivery fee to the cart subtotal", () => {
    expect(cartTotals([{ slug: "tee", size: "M", qty: 2 }], [tee], 60)).toEqual({ subtotal: 700, deliveryFee: 60, total: 760 });
  });
  it("leaves cancelled orders out of revenue", () => {
    const s = summarize([{ total: 350, status: "new" }, { total: 700, status: "cancelled" }, { total: 350, status: "delivered" }]);
    expect(s.revenue).toBe(700);
    expect(s.orders).toBe(2);
  });
});
