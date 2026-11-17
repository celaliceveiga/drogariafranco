import { useMemo, useState } from "react";
import { effectivePrice, discountPercent } from "@/lib/pricing";
import type { StoreProduct } from "@/lib/store-data";
import { MEDICINES_ENABLED } from "@/lib/store-mode";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

const SORTS = {
  relevancia: "Relevância",
  menor: "Menor preço",
  maior: "Maior preço",
  desconto: "Maior desconto",
  vendidos: "Mais vendidos",
  az: "A–Z",
} as const;

export function ProductGrid({ products, loading }: { products: StoreProduct[]; loading?: boolean }) {
  const [sort, setSort] = useState<keyof typeof SORTS>("relevancia");
  const [generic, setGeneric] = useState(false);
  const [promo, setPromo] = useState(false);
  const [stock, setStock] = useState(false);

  const list = useMemo(() => {
    let l = products.filter((p) => (!generic || p.is_generic) && (!promo || discountPercent(p) > 0) && (!stock || p.stock > 0));
    const s = [...l];
    if (sort === "menor") s.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "maior") s.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    if (sort === "desconto") s.sort((a, b) => discountPercent(b) - discountPercent(a));
    if (sort === "vendidos") s.sort((a, b) => b.sold_count - a.sold_count);
    if (sort === "az") s.sort((a, b) => a.name.localeCompare(b.name));
    return s;
  }, [products, sort, generic, promo, stock]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground">{list.length} produto(s)</span>
        {MEDICINES_ENABLED && <label className="flex items-center gap-1"><input type="checkbox" checked={generic} onChange={(e) => setGeneric(e.target.checked)} /> Genérico</label>}
        <label className="flex items-center gap-1"><input type="checkbox" checked={promo} onChange={(e) => setPromo(e.target.checked)} /> Com desconto</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} /> Em estoque</label>
        <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="ml-auto rounded-lg border px-2 py-1.5">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) : list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {!loading && list.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground">Tente outro termo ou remova filtros.</p>
        </div>
      )}
    </div>
  );
}
