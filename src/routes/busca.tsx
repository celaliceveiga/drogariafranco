import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_COLS, type StoreProduct } from "@/lib/store-data";
import { discountPercent } from "@/lib/pricing";
import { ProductGrid } from "@/components/store/ProductGrid";

export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    ofertas: s.ofertas === true || s.ofertas === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buscar produtos | Drogaria Franco" },
      { name: "description", content: "Busque medicamentos, genéricos e dermocosméticos por nome, marca ou princípio ativo." },
      { property: "og:title", content: "Buscar | Drogaria Franco" },
      { property: "og:description", content: "Encontre o que precisa na Drogaria Franco." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, ofertas } = Route.useSearch();
  const { data = [], isLoading } = useQuery({
    queryKey: ["search", q, ofertas],
    queryFn: async () => {
      let ids: string[] | null = null;
      if (q.trim()) {
        const { data, error } = await supabase.rpc("search_products", { q: q.trim(), lim: 60 });
        if (error) throw error;
        ids = data.map((p) => p.id);
        if (!ids.length) return [];
      }
      let query = supabase.from("products").select(PRODUCT_COLS).eq("status", "ativo");
      if (ids) query = query.in("id", ids);
      const { data, error } = await query;
      if (error) throw error;
      let list = data as unknown as StoreProduct[];
      if (ids) list = ids.map((id) => list.find((p) => p.id === id)!).filter(Boolean);
      if (ofertas) list = list.filter((p) => discountPercent(p) > 0);
      return list;
    },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold text-secondary">{ofertas ? "Ofertas" : q ? `Resultados para "${q}"` : "Todos os produtos"}</h1>
      <ProductGrid products={data} loading={isLoading} />
    </div>
  );
}
