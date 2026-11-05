import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { StoreProduct } from "@/lib/store-data";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export function ProductRail({ title, products, loading }: { title: string; products: StoreProduct[]; loading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  if (!loading && products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-secondary md:text-2xl">{title}</h2>
        <div className="hidden gap-2 md:flex">
          <button aria-label="Anterior" onClick={() => scroll(-1)} className="rounded-full border p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button aria-label="Próximo" onClick={() => scroll(1)} className="rounded-full border p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {(loading ? Array.from({ length: 5 }) : products).map((p, i) => (
          <div key={loading ? i : (p as StoreProduct).id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[19%]">
            {loading ? <ProductCardSkeleton /> : <ProductCard p={p as StoreProduct} />}
          </div>
        ))}
      </div>
    </section>
  );
}
