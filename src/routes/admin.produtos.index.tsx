import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/pricing";
import { mainImage } from "@/lib/store-data";

export const Route = createFileRoute("/admin/produtos/")({ component: ProductsAdmin });

function ProductsAdmin() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, product_images(url,sort_order)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const list = data.filter((p) => (!status || p.status === status) && (!q || norm(`${p.name} ${p.brand ?? ""} ${p.sku ?? ""} ${p.ean ?? ""}`).includes(norm(q))));

  async function quick(id: string, patch: { price?: number; promo_price?: number | null; stock?: number }) {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  async function bulk(action: "ativo" | "inativo" | "desconto") {
    if (!selected.length) return;
    if (action === "desconto") {
      const pct = Number(prompt("Desconto em %:"));
      if (!pct || pct <= 0 || pct >= 100) return;
      for (const id of selected) {
        const p = data.find((x) => x.id === id)!;
        await supabase.from("products").update({ promo_price: Math.round(Number(p.price) * (100 - pct)) / 100 }).eq("id", id);
      }
    } else {
      await supabase.from("products").update({ status: action }).in("id", selected);
    }
    toast.success("Ação aplicada");
    setSelected([]);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function duplicate(id: string) {
    const p = data.find((x) => x.id === id)!;
    const { id: _id, created_at, updated_at, search_text, product_images, ...rest } = p;
    const { data: np, error } = await supabase
      .from("products")
      .insert({ ...rest, name: `${p.name} (cópia)`, slug: `${p.slug}-copia-${Date.now().toString(36)}`, status: "rascunho" })
      .select("id")
      .single();
    if (error) return void toast.error(error.message);
    const { data: cats } = await supabase.from("product_categories").select("category_id").eq("product_id", id);
    if (cats?.length) await supabase.from("product_categories").insert(cats.map((c) => ({ product_id: np.id, category_id: c.category_id })));
    if (product_images.length) await supabase.from("product_images").insert(product_images.map((i) => ({ product_id: np.id, url: i.url, sort_order: i.sort_order })));
    navigate({ to: "/admin/produtos/$id", params: { id: np.id } });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-secondary">Produtos</h1>
        <Link to="/admin/produtos/$id" params={{ id: "novo" }} className="flex items-center gap-2 rounded-lg bg-primary-strong px-4 py-2 font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, marca, SKU, EAN" className="h-10 flex-1 rounded-lg border bg-background px-3" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border bg-background px-2">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="rascunho">Rascunho</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-primary-soft p-2 text-sm">
          <span className="font-semibold">{selected.length} selecionado(s):</span>
          <button onClick={() => bulk("ativo")} className="rounded border bg-background px-2 py-1">Ativar</button>
          <button onClick={() => bulk("inativo")} className="rounded border bg-background px-2 py-1">Desativar</button>
          <button onClick={() => bulk("desconto")} className="rounded border bg-background px-2 py-1">Aplicar desconto %</button>
        </div>
      )}
      <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3"><input type="checkbox" checked={selected.length === list.length && list.length > 0} onChange={(e) => setSelected(e.target.checked ? list.map((p) => p.id) : [])} /></th>
              <th className="p-3">Produto</th>
              <th className="p-3">Preço de</th>
              <th className="p-3">Preço por</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>}
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-surface">
                <td className="p-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))} /></td>
                <td className="p-3">
                  <Link to="/admin/produtos/$id" params={{ id: p.id }} className="flex items-center gap-3 hover:text-primary-strong">
                    <img src={mainImage(p)} alt="" className="h-10 w-10 rounded object-contain" />
                    <span className="line-clamp-2 font-semibold">{p.name}</span>
                  </Link>
                </td>
                <td className="p-3"><QuickNum value={Number(p.price)} onSave={(v) => quick(p.id, { price: v ?? 0 })} money /></td>
                <td className="p-3"><QuickNum value={p.promo_price == null ? null : Number(p.promo_price)} onSave={(v) => quick(p.id, { promo_price: v })} money /></td>
                <td className="p-3"><QuickNum value={p.stock} onSave={(v) => quick(p.id, { stock: v ?? 0 })} /></td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </td>
                <td className="p-3">
                  <button title="Duplicar" onClick={() => duplicate(p.id)} className="text-muted-foreground hover:text-primary-strong"><Copy className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickNum({ value, onSave, money }: { value: number | null; onSave: (v: number | null) => void; money?: boolean }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(value?.toString() ?? "");
  if (!edit)
    return (
      <button onClick={() => { setV(value?.toString() ?? ""); setEdit(true); }} className="rounded px-1 hover:bg-muted">
        {value == null ? "—" : money ? brl(value) : value}
      </button>
    );
  return (
    <input
      autoFocus
      type="number"
      step={money ? "0.01" : "1"}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        setEdit(false);
        const n = v === "" ? null : Number(v);
        if (n !== value) onSave(n);
      }}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className="h-8 w-24 rounded border px-2"
    />
  );
}
