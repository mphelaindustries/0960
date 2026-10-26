import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminProductsQuery, slugify } from "@/lib/admin";
import { SIZES } from "@/lib/types";
import { zar } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: Products });

type Draft = {
  id?: string;
  name: string;
  slug: string;
  price: string;
  tagline: string;
  description: string;
  front_image: string;
  back_image: string;
  active: boolean;
  stock: Record<string, string>;
};
const empty = (): Draft => ({
  name: "", slug: "", price: "", tagline: "", description: "", front_image: "", back_image: "", active: true,
  stock: Object.fromEntries(SIZES.map((s) => [s, "0"])),
});

async function uploadImage(file: File) {
  const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Upload failed");
  return data.signedUrl;
}

function Products() {
  const q = useQuery(adminProductsQuery);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const edit = (p: NonNullable<typeof q.data>[number]) =>
    setDraft({
      id: p.id, name: p.name, slug: p.slug, price: String(p.price), tagline: p.tagline, description: p.description,
      front_image: p.front_image, back_image: p.back_image, active: p.active,
      stock: Object.fromEntries(SIZES.map((s) => [s, String(p.product_stock.find((x) => x.size === s)?.quantity ?? 0)])),
    });

  const onFile = async (key: "front_image" | "back_image", file?: File) => {
    if (!file || !draft) return;
    setUploading(key);
    try {
      const url = await uploadImage(file);
      setDraft((d) => (d ? { ...d, [key]: url } : d));
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading("");
    }
  };

  const save = async () => {
    if (!draft) return;
    const price = Number(draft.price);
    const slug = slugify(draft.slug || draft.name);
    if (!draft.name.trim() || !slug) return void toast.error("Add a product name");
    if (!(price >= 0) || draft.price === "") return void toast.error("Add a valid price");
    if (!draft.front_image) return void toast.error("Add a front photo");
    setSaving(true);
    const row = {
      name: draft.name.trim(), slug, price, tagline: draft.tagline, description: draft.description,
      front_image: draft.front_image, back_image: draft.back_image, active: draft.active, updated_at: new Date().toISOString(),
    };
    const res = draft.id
      ? await supabase.from("products").update(row).eq("id", draft.id).select("id").single()
      : await supabase.from("products").insert(row).select("id").single();
    if (res.error || !res.data) {
      setSaving(false);
      return void toast.error(res.error?.code === "23505" ? "Another product already uses that link name" : "Couldn't save product");
    }
    const id = res.data.id;
    const { error } = await supabase.from("product_stock").upsert(
      SIZES.map((s) => ({ product_id: id, size: s, quantity: Math.max(0, Math.floor(Number(draft.stock[s]) || 0)) })),
    );
    setSaving(false);
    if (error) return void toast.error("Product saved, but stock didn't update");
    toast.success("Product saved");
    setDraft(null);
    refresh();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Past orders keep their details.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return void toast.error("Couldn't delete product");
    toast.success("Product deleted");
    refresh();
  };

  const input = "mt-1 w-full rounded-sm border border-input bg-card px-3 py-2";
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-6xl leading-none">PRODUCTS</h1>
        <button onClick={() => setDraft(empty())} className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>
      {q.isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(q.data ?? []).map((p) => {
            const total = p.product_stock.reduce((a, s) => a + s.quantity, 0);
            return (
              <div key={p.id} className="flex gap-4 rounded-sm border border-border bg-card p-4">
                <img src={p.front_image} alt="" className="h-24 w-24 shrink-0 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold uppercase">{p.name}</p>
                  <p className="text-sm">{zar(Number(p.price))}</p>
                  <p className="text-xs text-muted-foreground">
                    {total} in stock · {p.product_stock.map((s) => `${s.size}:${s.quantity}`).join(" ")}
                  </p>
                  {!p.active && <p className="text-xs font-bold uppercase text-destructive">Hidden from shop</p>}
                  <div className="mt-2 flex gap-3">
                    <button onClick={() => edit(p)} className="inline-flex items-center gap-1 text-sm underline"><Pencil className="h-3 w-3" /> Edit</button>
                    <button onClick={() => remove(p.id, p.name)} className="inline-flex items-center gap-1 text-sm text-destructive underline"><Trash2 className="h-3 w-3" /> Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{draft?.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="text-xs font-bold uppercase tracking-widest">Name</span>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })} className={input} /></label>
              <label><span className="text-xs font-bold uppercase tracking-widest">Price (R)</span>
                <input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={input} /></label>
              <label><span className="text-xs font-bold uppercase tracking-widest">Link name</span>
                <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className={input} /></label>
              <label className="sm:col-span-2"><span className="text-xs font-bold uppercase tracking-widest">Short line</span>
                <input value={draft.tagline} placeholder="Black · Front & Back Print" onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className={input} /></label>
              <label className="sm:col-span-2"><span className="text-xs font-bold uppercase tracking-widest">Description</span>
                <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={input} /></label>
              {(["front_image", "back_image"] as const).map((k) => (
                <div key={k}>
                  <span className="text-xs font-bold uppercase tracking-widest">{k === "front_image" ? "Front photo" : "Back photo"}</span>
                  <label className="mt-1 grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-sm border-2 border-dashed border-border bg-card">
                    {draft[k] ? <img src={draft[k]} alt="" className="h-full w-full object-cover" /> : (
                      <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground"><Upload className="h-5 w-5" />{uploading === k ? "Uploading…" : "Upload"}</span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(k, e.target.files?.[0])} />
                  </label>
                </div>
              ))}
              <div className="sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest">Stock per size</span>
                <div className="mt-1 grid grid-cols-5 gap-2">
                  {SIZES.map((s) => (
                    <label key={s} className="text-center text-xs font-bold">{s}
                      <input type="number" min="0" value={draft.stock[s]} onChange={(e) => setDraft({ ...draft, stock: { ...draft.stock, [s]: e.target.value } })} className={input + " text-center"} />
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                <span className="text-sm">Show in shop</span>
              </label>
              <button disabled={saving || !!uploading} onClick={save} className="rounded-sm bg-primary py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60 sm:col-span-2">
                {saving ? "Saving…" : "Save product"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
