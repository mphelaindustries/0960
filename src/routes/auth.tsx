import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : undefined);

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  head: () => ({
    meta: [
      { title: "Sign in — ELIM 0960" },
      { name: "description", content: "Sign in or create your ELIM 0960 account to save your details and track orders." },
      { property: "og:title", content: "Sign in — ELIM 0960" },
      { property: "og:description", content: "Sign in to your ELIM 0960 account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    const to = safePath(redirect);
    if (to) nav({ to, replace: true });
    else nav({ to: isAdmin ? "/admin" : "/account", replace: true });
  }, [user, isAdmin, loading, redirect, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) setMsg("Check your email and click the link to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMsg("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  const input = "mt-1 w-full rounded-sm border border-input bg-card px-3 py-3";
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-6xl leading-none">
        {mode === "in" ? "SIGN IN" : mode === "up" ? "CREATE ACCOUNT" : "RESET PASSWORD"}
      </h1>
      <p className="mt-2 text-muted-foreground">Save your delivery details and see all your orders in one place.</p>

      {mode !== "forgot" && (
        <>
          <button onClick={google} className="mt-8 w-full rounded-sm border-2 border-secondary py-3 text-sm font-bold uppercase tracking-widest hover:bg-secondary hover:text-secondary-foreground">
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === "up" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest">Full name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </label>
        )}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
        {mode !== "forgot" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          </label>
        )}
        {msg && <p className="rounded-sm bg-secondary p-3 text-sm text-secondary-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent disabled:opacity-60">
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
        {mode === "in" ? (
          <>
            <button onClick={() => setMode("up")} className="underline">Create an account</button>
            <button onClick={() => setMode("forgot")} className="underline">Forgot password?</button>
          </>
        ) : (
          <button onClick={() => setMode("in")} className="underline">Back to sign in</button>
        )}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account needed to shop — <Link to="/shop" className="underline">continue as guest</Link>.
      </p>
    </section>
  );
}
