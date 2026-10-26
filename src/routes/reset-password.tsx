import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — ELIM 0960" },
      { name: "description", content: "Choose a new password for your ELIM 0960 account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Set a new password — ELIM 0960" },
      { property: "og:description", content: "Choose a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/account" });
  };
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-6xl leading-none">NEW PASSWORD</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest">New password</span>
          <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-card px-3 py-3" />
        </label>
        <button disabled={busy} className="w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60">
          Save password
        </button>
      </form>
    </section>
  );
}
