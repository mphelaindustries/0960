import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useSignOut } from "@/hooks/use-auth";
import { zar } from "@/lib/store";
import { STATUS_LABEL } from "@/components/receipt";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — ELIM 0960" },
      { name: "description", content: "Your saved details and order history." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My account — ELIM 0960" },
      { property: "og:description", content: "Your saved details and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

const FIELDS = [
  { k: "full_name", label: "Full name" },
  { k: "phone", label: "Phone number" },
  { k: "address", label: "Street address", wide: true },
  { k: "city", label: "Town / city" },
  { k: "postal", label: "Postal code" },
] as const;
type ProfileForm = Record<(typeof FIELDS)[number]["k"], string>;

function Account() {
  const { user, isAdmin } = useAuth();
  const { user: routeUser } = Route.useRouteContext();
  const uid = user?.id ?? routeUser.id;
  const signOut = useSignOut();
  const qc = useQueryClient();
  const [f, setF] = useState<ProfileForm>({ full_name: "", phone: "", address: "", city: "", postal: "" });
  const [saving, setSaving] = useState(false);

  const profile = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()).data,
  });
  const orders = useQuery({
    queryKey: ["my-orders", uid],
    queryFn: async () =>
      (await supabase.from("orders").select("id, order_number, total, status, created_at").eq("user_id", uid).order("created_at", { ascending: false })).data ?? [],
  });

  useEffect(() => {
    const p = profile.data;
    if (p) setF({ full_name: p.full_name, phone: p.phone, address: p.address, city: p.city, postal: p.postal });
  }, [profile.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ ...f, updated_at: new Date().toISOString() }).eq("id", uid);
    setSaving(false);
    if (error) return toast.error("Couldn't save your details");
    toast.success("Details saved");
    qc.invalidateQueries({ queryKey: ["profile", uid] });
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-6xl leading-none">MY ACCOUNT</h1>
          <button onClick={signOut} className="inline-flex items-center gap-2 text-sm underline"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
        <p className="mt-2 text-muted-foreground">{profile.data?.email ?? user?.email}</p>
        {isAdmin && (
          <Link to="/admin" className="mt-4 inline-block rounded-sm bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground">
            Open store dashboard
          </Link>
        )}
        <form onSubmit={save} className="mt-8 grid gap-4 sm:grid-cols-2">
          <p className="font-display text-3xl sm:col-span-2">DELIVERY DETAILS</p>
          {FIELDS.map((x) => (
            <label key={x.k} className={"wide" in x ? "sm:col-span-2" : ""}>
              <span className="text-xs font-bold uppercase tracking-widest">{x.label}</span>
              <input value={f[x.k]} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} className="mt-1 w-full rounded-sm border border-input bg-card px-3 py-3" />
            </label>
          ))}
          <button disabled={saving} className="rounded-sm bg-primary py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60 sm:col-span-2">
            {saving ? "Saving…" : "Save details"}
          </button>
        </form>
      </div>
      <div>
        <p className="font-display text-4xl">MY ORDERS</p>
        {orders.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : !orders.data?.length ? (
          <p className="mt-4 text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link>.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {orders.data.map((o) => (
              <li key={o.id}>
                <Link to="/order/$id" params={{ id: o.id }} className="flex items-center justify-between gap-4 py-4 hover:text-accent">
                  <div>
                    <p className="font-bold">Order #{o.order_number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{zar(Number(o.total))}</p>
                    <p className="text-xs uppercase tracking-widest">{STATUS_LABEL[o.status]}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
