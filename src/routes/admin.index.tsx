import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, FolderTree } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const [prods, cats, low] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id,name,stock,min_stock").order("stock").limit(50),
      ]);
      return { prods: prods.count ?? 0, cats: cats.count ?? 0, low: (low.data ?? []).filter((p) => p.stock <= p.min_stock) };
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-secondary">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card icon={Package} label="Produtos" value={data?.prods} />
        <Card icon={FolderTree} label="Categorias" value={data?.cats} />
        <Card icon={AlertTriangle} label="Estoque baixo" value={data?.low.length} />
      </div>
      <div className="mt-6 rounded-xl border bg-background p-5">
        <h2 className="font-bold">Produtos com estoque baixo</h2>
        <ul className="mt-3 divide-y text-sm">
          {data?.low.map((p) => (
            <li key={p.id} className="flex justify-between py-2">
              <Link to="/admin/produtos/$id" params={{ id: p.id }} className="hover:text-primary-strong">{p.name}</Link>
              <span className={p.stock === 0 ? "font-bold text-destructive" : "text-warning"}>{p.stock} un.</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Vendas, pedidos e receitas aparecerão aqui quando o checkout estiver ativo.</p>
    </div>
  );
}

function Card({ icon: I, label, value }: { icon: typeof Package; label: string; value?: number }) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <I className="h-5 w-5 text-primary" />
      <p className="mt-2 text-3xl font-extrabold">{value ?? "—"}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
