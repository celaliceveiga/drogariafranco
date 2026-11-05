import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, slugify } from "@/lib/pricing";
import { categoriesQuery } from "@/lib/store-data";

export const Route = createFileRoute("/admin/produtos/$id")({ component: ProductForm });

type Img = { url: string; sort_order: number };
const EMPTY = {
  name: "", slug: "", brand: "", kind: "outros", sale_class: "livre", is_generic: false,
  active_ingredient: "", concentration: "", presentation: "", anvisa_registry: "", ean: "", sku: "",
  price: 0, promo_price: null as number | null, promo_start: "", promo_end: "", cost: null as number | null,
  stock: 0, min_stock: 5, weight_g: null as number | null, width_cm: null as number | null, height_cm: null as number | null, length_cm: null as number | null,
  description: "", indications: "", usage: "", composition: "", warnings: "", leaflet_url: "",
  tags: "" as string, status: "rascunho", featured: false, seo_title: "", seo_description: "",
};

function ProductForm() {
  const { id } = Route.useParams();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [f, setF] = useState<typeof EMPTY>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [catIds, setCatIds] = useState<string[]>([]);
  const [imgs, setImgs] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: p } = await supabase.from("products").select("*, product_images(url,sort_order), product_categories(category_id)").eq("id", id).single();
      if (!p) return;
      const { product_images, product_categories, ...rest } = p;
      setF({
        ...EMPTY,
        ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? (typeof (EMPTY as Record<string, unknown>)[k] === "string" ? "" : v)])),
        tags: (p.tags ?? []).join(", "),
        promo_start: p.promo_start?.slice(0, 10) ?? "",
        promo_end: p.promo_end?.slice(0, 10) ?? "",
      } as typeof EMPTY);
      setSlugTouched(true);
      setCatIds(product_categories.map((c) => c.category_id));
      setImgs([...product_images].sort((a, b) => a.sort_order - b.sort_order));
    })();
  }, [id, isNew]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setF((prev) => ({ ...prev, [k]: v, ...(k === "name" && !slugTouched ? { slug: slugify(String(v)) } : {}) }));

  async function upload(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (data) setImgs((prev) => [...prev, { url: data.signedUrl, sort_order: prev.length }]);
    }
  }

  function move(i: number, d: number) {
    const next = [...imgs];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setImgs(next);
  }

  async function save() {
    if (!f.name || !f.slug) return toast.error("Nome e slug são obrigatórios");
    setBusy(true);
    const payload = {
      ...f,
      kind: f.kind as "outros",
      sale_class: f.sale_class as "livre",
      status: f.status as "ativo",
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      promo_start: f.promo_start || null,
      promo_end: f.promo_end ? `${f.promo_end}T23:59:59` : null,
      price: Number(f.price),
      promo_price: f.promo_price === null || (f.promo_price as unknown) === "" ? null : Number(f.promo_price),
    };
    const res = isNew
      ? await supabase.from("products").insert(payload).select("id").single()
      : await supabase.from("products").update(payload).eq("id", id).select("id").single();
    if (res.error) { setBusy(false); return toast.error(res.error.message); }
    const pid = res.data.id;
    await supabase.from("product_categories").delete().eq("product_id", pid);
    if (catIds.length) await supabase.from("product_categories").insert(catIds.map((c) => ({ product_id: pid, category_id: c })));
    await supabase.from("product_images").delete().eq("product_id", pid);
    if (imgs.length) await supabase.from("product_images").insert(imgs.map((im, i) => ({ product_id: pid, url: im.url, sort_order: i, alt: f.name })));
    setBusy(false);
    toast.success("Produto salvo");
    qc.invalidateQueries();
    if (isNew) navigate({ to: "/admin/produtos/$id", params: { id: pid } });
  }

  async function remove() {
    if (!confirm("Excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    qc.invalidateQueries();
    navigate({ to: "/admin/produtos" });
  }

  const inp = "h-10 w-full rounded-lg border bg-background px-3 text-sm";
  const ta = "min-h-24 w-full rounded-lg border bg-background p-3 text-sm";
  const margin = f.cost && f.price ? Math.round((1 - Number(f.cost) / Number(f.promo_price ?? f.price)) * 100) : null;
  const roots = cats.filter((c) => !c.parent_id);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-secondary">{isNew ? "Novo produto" : "Editar produto"}</h1>
        <div className="flex gap-2">
          {!isNew && <button onClick={remove} className="rounded-lg border px-4 py-2 text-sm font-semibold text-destructive">Excluir</button>}
          <button disabled={busy} onClick={save} className="rounded-lg bg-primary-strong px-5 py-2 font-bold text-primary-foreground">{busy ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Box title="Informações básicas">
            <Field label="Nome"><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Slug (URL)"><input className={inp} value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Marca"><input className={inp} value={f.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
              <Field label="Tipo">
                <select className={inp} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
                  {[["medicamento","Medicamento"],["dermocosmetico","Dermocosmético"],["higiene","Higiene"],["beleza","Beleza"],["infantil","Infantil"],["suplemento","Suplemento"],["outros","Outros"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Classificação de venda">
              <select className={inp} value={f.sale_class} onChange={(e) => set("sale_class", e.target.value)}>
                <option value="livre">Venda livre (MIP)</option>
                <option value="receita">Exige receita simples (tarja vermelha)</option>
                <option value="controlado">Controlado (tarja preta / Portaria 344) — só loja física</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_generic} onChange={(e) => set("is_generic", e.target.checked)} /> Genérico</label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Princípio ativo"><input className={inp} value={f.active_ingredient} onChange={(e) => set("active_ingredient", e.target.value)} /></Field>
              <Field label="Concentração"><input className={inp} value={f.concentration} onChange={(e) => set("concentration", e.target.value)} /></Field>
              <Field label="Apresentação"><input className={inp} value={f.presentation} onChange={(e) => set("presentation", e.target.value)} /></Field>
              <Field label="Registro ANVISA"><input className={inp} value={f.anvisa_registry} onChange={(e) => set("anvisa_registry", e.target.value)} /></Field>
              <Field label="EAN"><input className={inp} value={f.ean} onChange={(e) => set("ean", e.target.value)} /></Field>
              <Field label="SKU"><input className={inp} value={f.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
            </div>
          </Box>

          <Box title="Fotos (a primeira é a principal)">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground hover:border-primary">
              <Upload className="h-5 w-5" /> Enviar fotos
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {imgs.map((im, i) => (
                <div key={im.url + i} className={`relative rounded-lg border-2 p-1 ${i === 0 ? "border-primary" : "border-transparent"}`}>
                  <img src={im.url} alt="" className="aspect-square w-full rounded object-contain" />
                  <div className="mt-1 flex justify-between">
                    <button aria-label="Mover para trás" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4 -rotate-90" /></button>
                    <button aria-label="Remover" onClick={() => setImgs(imgs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></button>
                    <button aria-label="Mover para frente" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4 -rotate-90" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Box>

          <Box title="Textos">
            <Field label="Descrição"><textarea className={ta} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Indicações"><textarea className={ta} value={f.indications} onChange={(e) => set("indications", e.target.value)} /></Field>
            <Field label="Modo de uso"><textarea className={ta} value={f.usage} onChange={(e) => set("usage", e.target.value)} /></Field>
            <Field label="Composição"><textarea className={ta} value={f.composition} onChange={(e) => set("composition", e.target.value)} /></Field>
            <Field label="Contraindicações e advertências"><textarea className={ta} value={f.warnings} onChange={(e) => set("warnings", e.target.value)} /></Field>
            <Field label="Link da bula (PDF)"><input className={inp} value={f.leaflet_url} onChange={(e) => set("leaflet_url", e.target.value)} /></Field>
          </Box>

          <Box title="SEO">
            <Field label="Título"><input className={inp} value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></Field>
            <Field label="Descrição"><textarea className={ta} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></Field>
          </Box>
        </div>

        <div className="space-y-6">
          <Box title="Status">
            <select className={inp} value={f.status} onChange={(e) => set("status", e.target.value)}>
              <option value="ativo">Ativo</option><option value="rascunho">Rascunho</option><option value="inativo">Inativo</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Destaque na home</label>
            <Field label="Tags (separadas por vírgula)"><input className={inp} value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="mais-vendido, oferta-da-semana" /></Field>
          </Box>
          <Box title="Preço">
            <Field label="Preço de (R$)"><input type="number" step="0.01" className={inp} value={f.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Preço por / promocional (R$)"><input type="number" step="0.01" className={inp} value={f.promo_price ?? ""} onChange={(e) => set("promo_price", e.target.value === "" ? null : Number(e.target.value))} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Início promo"><input type="date" className={inp} value={f.promo_start} onChange={(e) => set("promo_start", e.target.value)} /></Field>
              <Field label="Fim promo"><input type="date" className={inp} value={f.promo_end} onChange={(e) => set("promo_end", e.target.value)} /></Field>
            </div>
            <Field label="Custo (só admin)"><input type="number" step="0.01" className={inp} value={f.cost ?? ""} onChange={(e) => set("cost", e.target.value === "" ? null : Number(e.target.value))} /></Field>
            {margin !== null && <p className="text-sm">Margem: <strong>{margin}%</strong> ({brl(Number(f.promo_price ?? f.price) - Number(f.cost))})</p>}
          </Box>
          <Box title="Estoque e frete">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Estoque"><input type="number" className={inp} value={f.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
              <Field label="Alerta mínimo"><input type="number" className={inp} value={f.min_stock} onChange={(e) => set("min_stock", Number(e.target.value))} /></Field>
              <Field label="Peso (g)"><input type="number" className={inp} value={f.weight_g ?? ""} onChange={(e) => set("weight_g", e.target.value === "" ? null : Number(e.target.value))} /></Field>
              <Field label="Largura (cm)"><input type="number" className={inp} value={f.width_cm ?? ""} onChange={(e) => set("width_cm", e.target.value === "" ? null : Number(e.target.value))} /></Field>
              <Field label="Altura (cm)"><input type="number" className={inp} value={f.height_cm ?? ""} onChange={(e) => set("height_cm", e.target.value === "" ? null : Number(e.target.value))} /></Field>
              <Field label="Compr. (cm)"><input type="number" className={inp} value={f.length_cm ?? ""} onChange={(e) => set("length_cm", e.target.value === "" ? null : Number(e.target.value))} /></Field>
            </div>
          </Box>
          <Box title="Categorias">
            <div className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {roots.map((r) => (
                <div key={r.id}>
                  <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={catIds.includes(r.id)} onChange={(e) => setCatIds(e.target.checked ? [...catIds, r.id] : catIds.filter((x) => x !== r.id))} /> {r.name}</label>
                  {cats.filter((s) => s.parent_id === r.id).map((s) => (
                    <label key={s.id} className="ml-5 flex items-center gap-2"><input type="checkbox" checked={catIds.includes(s.id)} onChange={(e) => setCatIds(e.target.checked ? [...catIds, s.id] : catIds.filter((x) => x !== s.id))} /> {s.name}</label>
                  ))}
                </div>
              ))}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 rounded-xl border bg-background p-5"><h2 className="font-bold">{title}</h2>{children}</section>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
