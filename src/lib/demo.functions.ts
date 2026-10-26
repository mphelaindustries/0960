import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// PROTOTYPE ONLY: creates/ensures confirmed demo accounts. Remove before launch.
export const DEMO_ACCOUNTS = {
  owner: { email: "demo.owner@elim0960.test", password: "DemoOwner0960!" },
  customer: { email: "demo.customer@elim0960.test", password: "DemoCustomer0960!" },
} as const;

export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ kind: z.enum(["owner", "customer"]) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const acct = DEMO_ACCOUNTS[data.kind];
    const name = data.kind === "owner" ? "Demo Owner" : "Demo Customer";
    let userId: string | undefined;
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: acct.email,
      password: acct.password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (created?.user) userId = created.user.id;
    else if (error) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      userId = list?.users.find((u) => u.email === acct.email)?.id;
    }
    if (!userId) throw new Error("Could not prepare demo account");
    if (data.kind === "owner") {
      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
    return { ok: true };
  });
