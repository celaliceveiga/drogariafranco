import { createFileRoute, Link } from "@tanstack/react-router";
import { MEDICINES_ENABLED, isMedicine } from "@/lib/store-mode";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Store, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart, pushRecentlyViewed } from "@/lib/cart";
import { brl, discountPercent, effectivePrice, installments, isPromoActive } from "@/lib/pricing";
import { settingsQuery } from "@/lib/store-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | Drogaria Franco` },
      { name: "description", content: "Compre na Drogaria Franco com preço baixo e entrega rápida." },
      { property: "og:title", content: "Produto | Drogaria Franco" },
      { property: "og:description", content: "Compre na Drogaria Franco." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const { data: s } = useQuery(settingsQuery);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, product_images(url,alt,sort_order)").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    if (p) pushRecentlyViewed(p.id);
  }, [p]);

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><div className="h-96 animate-pulse rounded-xl bg-muted" /></div>;
  if (!p || (!MEDICINES_ENABLED && isMedicine(p))) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><h1 className="text-xl font-bold">Produto não encontrado</h1><Link to="/" className="text-primary-strong underline">Voltar</Link></div>;

  const imgs = [...p.product_images].sort((a, b) => a.sort_order - b.sort_order);
  const price = effectivePrice(p);
  const off = discountPercent(p);
  const inst = installments(price, s?.max_installments ?? 3, Number(s?.min_installment ?? 20));
  const controlled = p.sale_class === "controlado";
  const isMed = p.kind === "medicamento";
  const sections = [
    ["Descrição", p.description],
    ["Indicações", p.indications],
    ["Modo de uso", p.usage],
    ["Composição / Princípio ativo", p.composition ?? p.active_ingredient],
    ["Contraindicações e advertências", p.warnings],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-xs text-muted-foreground"><Link to="/">Início</Link> / <span className="text-foreground">{p.name}</span></nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border bg-background">
            <img src={imgs[imgIdx]?.url ?? "/images/sample-saude.jpg"} alt={p.name} className="h-full w-full object-contain transition hover:scale-125" />
          </div>
          {imgs.length > 1 && (
            <div className="mt-3 flex gap-2">
              {imgs.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                  <img src={im.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {p.brand && <p className="text-sm text-muted-foreground">{p.brand}</p>}
          <h1 className="text-2xl font-extrabold text-secondary md:text-3xl">{p.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {p.is_generic && <span className="rounded-md bg-warning px-2 py-0.5 font-bold text-warning-foreground">GENÉRICO</span>}
            {p.sale_class === "receita" && <span className="rounded-md bg-rx px-2 py-0.5 font-bold text-rx-foreground">EXIGE RECEITA</span>}
            {p.presentation && <span className="rounded-md bg-muted px-2 py-0.5">{p.presentation}</span>}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {p.sku && <>SKU {p.sku} · </>}{p.ean && <>EAN {p.ean} · </>}{p.anvisa_registry && <>Registro ANVISA {p.anvisa_registry}</>}
          </p>

          <div className="mt-5 rounded-xl border p-5">
            {isPromoActive(p) && (
              <p className="text-sm text-muted-foreground">
                <span className="line-through">{brl(Number(p.price))}</span> <span className="ml-2 rounded bg-success px-1.5 py-0.5 text-xs font-bold text-success-foreground">-{off}%</span>
              </p>
            )}
            <p className="text-4xl font-extrabold text-secondary">{brl(price)}</p>
            {inst && <p className="text-sm text-muted-foreground">ou {inst.count}x de {brl(inst.value)} sem juros</p>}
            {isPromoActive(p) && <p className="mt-1 text-sm font-semibold text-success">Você economiza {brl(Number(p.price) - price)}</p>}

            {controlled ? (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm font-semibold"><Store className="h-5 w-5" /> Disponível somente na loja física (medicamento controlado).</p>
            ) : p.stock <= 0 ? (
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm font-semibold">Produto indisponível no momento.</p>
            ) : (
              <div className="mt-4 flex gap-3">
                <div className="flex items-center rounded-lg border">
                  <button aria-label="Diminuir" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button aria-label="Aumentar" className="p-3" onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus className="h-4 w-4" /></button>
                </div>
                <button
                  onClick={() => {
                    cart.add(p.id, qty);
                    toast.success("Adicionado ao carrinho");
                    cart.setOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-strong font-bold text-primary-foreground hover:bg-secondary"
                >
                  <ShoppingCart className="h-5 w-5" /> Adicionar ao carrinho
                </button>
              </div>
            )}
          </div>

          {p.leaflet_url && (
            <a href={p.leaflet_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-strong"><FileText className="h-4 w-4" /> Ver bula (PDF)</a>
          )}

          {isMed && (
            <div className="mt-5 flex gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-xs font-semibold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <p>
                {p.name} é um medicamento. Seu uso pode trazer riscos. Procure o médico e o farmacêutico. Leia a bula.
                <br />Se persistirem os sintomas, o médico deverá ser consultado.
              </p>
            </div>
          )}
        </div>
      </div>

      {sections.length > 0 && (
        <Accordion type="multiple" defaultValue={["Descrição"]} className="mt-10 max-w-3xl">
          {sections.map(([t, v]) => (
            <AccordionItem key={t} value={t as string}>
              <AccordionTrigger className="font-bold">{t}</AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">{v}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
