import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { BarChart3, Package, Receipt, Users, Settings, Store, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSignOut } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Store dashboard — ELIM 0960" },
      { name: "description", content: "Manage products, orders and customers." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Store dashboard — ELIM 0960" },
      { property: "og:description", content: "Manage your store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/account" });
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const signOut = useSignOut();
  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[230px_1fr]">
      <aside className="bg-ink text-ink-foreground md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="font-display text-3xl leading-none">
            ELIM<span className="text-primary">.</span>
            <span className="ml-2 align-middle font-body text-[10px] tracking-[0.3em] text-ink-muted">ADMIN</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map(({ to, label, icon: I, ...rest }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: "exact" in rest }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "hover:bg-line" }}
              className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-widest"
            >
              <I className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-col gap-1 px-3 pt-6 md:flex">
          <Link to="/" className="flex items-center gap-3 rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-ink-foreground">
            <Store className="h-4 w-4" /> View store
          </Link>
          <button onClick={signOut} className="flex items-center gap-3 rounded-sm px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-ink-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}
