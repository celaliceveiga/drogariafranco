import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, PRODUCT_COLS, type StoreProduct } from "@/lib/store-data";
import { ProductGrid } from "@/components/store/ProductGrid";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | Drogaria Franco` },
      { name: "description", content: "Confira os produtos desta categoria na Drogaria Franco." },
      { property: "og:title", content: "Categoria | Drogaria Franco" },
      { property: "og:description", content: "Produtos com preço baixo na Drogaria Franco." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const cat = cats.find((c) => c.slug === slug);
  const parent = cat?.parent_id ? cats.find((c) => c.id === cat.parent_id) : null;
  const subs = cat ? cats.filter((c) => c.parent_id === cat.id) : [];
  const ids = cat ? [cat.id, ...subs.map((s) => s.id)] : [];

  const { data = [], isLoading } = useQuery({
    queryKey: ["category-products", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`${PRODUCT_COLS},product_categories!inner(category_id)`)
        .eq("status", "ativo")
        .in("product_categories.category_id", ids);
      if (error) throw error;
      const seen = new Set<string>();
      return (data as unknown as StoreProduct[]).filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/">Início</Link>
        {parent && <> / <Link to="/categoria/$slug" params={{ slug: parent.slug }}>{parent.name}</Link></>}
        {cat && <> / <span className="text-foreground">{cat.name}</span></>}
      </nav>
      <h1 className="mb-4 text-2xl font-extrabold text-secondary">{cat?.name ?? "Categoria"}</h1>
      {subs.length > 0 && (
        <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
          {subs.map((s) => (
            <Link key={s.id} to="/categoria/$slug" params={{ slug: s.slug }} className="shrink-0 rounded-full border px-4 py-1.5 text-sm hover:border-primary hover:text-primary-strong">
              {s.name}
            </Link>
          ))}
        </div>
      )}
      <ProductGrid products={data} loading={isLoading || !cat} />
    </div>
  );
}
