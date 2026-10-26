import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => (await supabase.from("store_settings").select("*").eq("id", 1).single()).data,
  });
  const [f, setF] = useState({ store_name: "", whatsapp_number: "", delivery_fee: "0", contact_email: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (q.data) setF({ store_name: q.data.store_name, whatsapp_number: q.data.whatsapp_number, delivery_fee: String(q.data.delivery_fee), contact_email: q.data.contact_email });
  }, [q.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const number = f.whatsapp_number.replace(/\D/g, "");
    if (number.length < 10) return void toast.error("Enter the WhatsApp number with country code, e.g. 27821234567");
    const fee = Number(f.delivery_fee);
    if (!(fee >= 0)) return void toast.error("Enter a valid delivery fee");
    setSaving(true);
    const { error } = await supabase.from("store_settings").update({
      store_name: f.store_name.trim() || "ELIM 0960", whatsapp_number: number, delivery_fee: fee,
      contact_email: f.contact_email.trim(), updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) return void toast.error("Couldn't save settings");
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const input = "mt-1 w-full rounded-sm border border-input bg-card px-3 py-3";
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-6xl leading-none">SETTINGS</h1>
      <form onSubmit={save} className="mt-8 space-y-4">
        <label className="block"><span className="text-xs font-bold uppercase tracking-widest">Store name</span>
          <input value={f.store_name} onChange={(e) => setF({ ...f, store_name: e.target.value })} className={input} /></label>
        <label className="block"><span className="text-xs font-bold uppercase tracking-widest">WhatsApp number (orders go here)</span>
          <input value={f.whatsapp_number} placeholder="27821234567" onChange={(e) => setF({ ...f, whatsapp_number: e.target.value })} className={input} /></label>
        <label className="block"><span className="text-xs font-bold uppercase tracking-widest">Delivery fee (R) — 0 means confirm on WhatsApp</span>
          <input type="number" min="0" step="0.01" value={f.delivery_fee} onChange={(e) => setF({ ...f, delivery_fee: e.target.value })} className={input} /></label>
        <label className="block"><span className="text-xs font-bold uppercase tracking-widest">Contact email</span>
          <input type="email" value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} className={input} /></label>
        <button disabled={saving} className="w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
