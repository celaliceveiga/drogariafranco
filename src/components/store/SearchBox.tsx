import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl, effectivePrice } from "@/lib/pricing";
import { categoriesQuery } from "@/lib/store-data";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function SearchBox() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { data: cats = [] } = useQuery(categoriesQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const { data: results = [] } = useQuery({
    queryKey: ["search-suggest", debounced],
    enabled: debounced.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_products", { q: debounced, lim: 6 });
      if (error) throw error;
      const ids = data.map((p) => p.id);
      const { data: imgs } = await supabase.from("product_images").select("product_id,url,sort_order").in("product_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      return data.map((p) => ({ ...p, img: imgs?.filter((i) => i.product_id === p.id).sort((a, b) => a.sort_order - b.sort_order)[0]?.url }));
    },
  });

  const catMatches = debounced.length >= 2 ? cats.filter((c) => norm(c.name).includes(norm(debounced))).slice(0, 3) : [];

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          navigate({ to: "/busca", search: { q } });
        }}
      >
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="O que você procura? Nome, princípio ativo ou marca"
          className="h-11 w-full rounded-full border-0 bg-background pl-4 pr-12 text-sm text-foreground shadow-sm outline-none ring-2 ring-transparent focus:ring-secondary"
          aria-label="Buscar produtos"
        />
        <button aria-label="Buscar" className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Search className="h-4 w-4" />
        </button>
      </form>
      {open && (results.length > 0 || catMatches.length > 0) && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl">
          {catMatches.map((c) => (
            <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-muted">
              Categoria: <strong>{c.name}</strong>
            </Link>
          ))}
          {results.map((p) => (
            <Link key={p.id} to="/produto/$slug" params={{ slug: p.slug }} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-muted">
              <img src={p.img ?? "/images/sample-saude.jpg"} alt="" className="h-10 w-10 rounded object-contain" />
              <span className="line-clamp-1 flex-1 text-sm">{p.name}</span>
              <span className="text-sm font-bold text-secondary">{brl(effectivePrice(p))}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
