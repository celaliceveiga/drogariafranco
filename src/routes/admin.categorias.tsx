import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/pricing";
import { categoriesQuery, type Category } from "@/lib/store-data";

export const Route = createFileRoute("/admin/categorias")({ component: CategoriesAdmin });

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["categories"] });

  async function add() {
    if (!name.trim()) return;
    const siblings = cats.filter((c) => (c.parent_id ?? "") === parent);
    const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), parent_id: parent || null, sort_order: siblings.length + 1 });
    if (error) return void toast.error(error.message);
    setName("");
    refresh();
  }
  async function update(id: string, patch: Partial<Category>) {
    const { error } = await supabase.from("categories").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    refresh();
  }
  async function move(c: Category, d: number) {
    const sib = cats.filter((x) => x.parent_id === c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const i = sib.findIndex((x) => x.id === c.id);
    const o = sib[i + d];
    if (!o) return;
    await supabase.from("categories").update({ sort_order: o.sort_order }).eq("id", c.id);
    await supabase.from("categories").update({ sort_order: c.sort_order }).eq("id", o.id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("Excluir categoria (e subcategorias)?")) return;
    await supabase.from("categories").delete().eq("id", id);
    refresh();
  }

  const roots = cats.filter((c) => !c.parent_id);
  const Row = ({ c, sub }: { c: Category; sub?: boolean }) => (
    <div className={`flex flex-wrap items-center gap-2 py-2 ${sub ? "pl-8" : ""}`}>
      <input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update(c.id, { name: e.target.value })} className={`h-9 flex-1 rounded border px-2 text-sm ${sub ? "" : "font-bold"}`} />
      {!sub && <input defaultValue={c.icon ?? ""} placeholder="Ícone" title="Nome do ícone (ex.: Pill, Baby)" onBlur={(e) => update(c.id, { icon: e.target.value })} className="h-9 w-28 rounded border px-2 text-sm" />}
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={c.active} onChange={(e) => update(c.id, { active: e.target.checked })} /> Ativa</label>
      <button aria-label="Subir" onClick={() => move(c, -1)}><ArrowUp className="h-4 w-4" /></button>
      <button aria-label="Descer" onClick={() => move(c, 1)}><ArrowDown className="h-4 w-4" /></button>
      <button aria-label="Excluir" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-secondary">Categorias</h1>
      <div className="mt-4 flex flex-wrap gap-2 rounded-xl border bg-background p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria" className="h-10 flex-1 rounded-lg border px-3" />
        <select value={parent} onChange={(e) => setParent(e.target.value)} className="h-10 rounded-lg border px-2">
          <option value="">— Categoria principal —</option>
          {roots.map((r) => <option key={r.id} value={r.id}>Sub de {r.name}</option>)}
        </select>
        <button onClick={add} className="h-10 rounded-lg bg-primary-strong px-4 font-bold text-primary-foreground">Adicionar</button>
      </div>
      <div className="mt-4 divide-y rounded-xl border bg-background px-4">
        {roots.map((r) => (
          <div key={r.id} className="py-2">
            <Row c={r} />
            {cats.filter((s) => s.parent_id === r.id).sort((a, b) => a.sort_order - b.sort_order).map((s) => <Row key={s.id} c={s} sub />)}
          </div>
        ))}
      </div>
    </div>
  );
}
