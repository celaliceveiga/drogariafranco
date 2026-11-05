import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_COLS =
  "id,name,slug,brand,kind,sale_class,is_generic,active_ingredient,presentation,price,promo_price,promo_start,promo_end,stock,min_stock,tags,sold_count,status,product_images(url,alt,sort_order)";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  kind: string;
  sale_class: "livre" | "receita" | "controlado";
  is_generic: boolean;
  active_ingredient: string | null;
  presentation: string | null;
  price: number;
  promo_price: number | null;
  promo_start: string | null;
  promo_end: string | null;
  stock: number;
  min_stock: number;
  tags: string[];
  sold_count: number;
  product_images: { url: string; alt: string | null; sort_order: number }[];
};

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id,parent_id,name,slug,icon,sort_order,active")
      .order("sort_order");
    if (error) throw error;
    return data as Category[];
  },
  staleTime: 60_000,
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase.from("banners").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    const now = new Date();
    return data.filter(
      (b) => (!b.starts_at || new Date(b.starts_at) <= now) && (!b.ends_at || new Date(b.ends_at) >= now),
    );
  },
});

export const showcasesQuery = queryOptions({
  queryKey: ["showcases"],
  queryFn: async () => {
    const { data, error } = await supabase.from("showcases").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export function showcaseProductsQuery(sc: { id: string; rule: string; rule_value: string | null; product_ids: string[] }) {
  return queryOptions({
    queryKey: ["showcase-products", sc.id],
    queryFn: async () => {
      let q = supabase.from("products").select(PRODUCT_COLS).eq("status", "ativo").limit(12);
      if (sc.rule === "manual") q = q.in("id", sc.product_ids.length ? sc.product_ids : ["00000000-0000-0000-0000-000000000000"]);
      else if (sc.rule === "tag" && sc.rule_value) q = q.contains("tags", [sc.rule_value]);
      else if (sc.rule === "generic") q = q.eq("is_generic", true).order("price");
      else if (sc.rule === "bestsellers") q = q.order("sold_count", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as StoreProduct[];
    },
  });
}

export function productsByIdsQuery(ids: string[]) {
  return queryOptions({
    queryKey: ["products-by-ids", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase.from("products").select(PRODUCT_COLS).in("id", ids);
      if (error) throw error;
      const list = data as unknown as StoreProduct[];
      return ids.map((id) => list.find((p) => p.id === id)).filter(Boolean) as StoreProduct[];
    },
  });
}

export function mainImage(p: { product_images?: { url: string; sort_order: number }[] }) {
  const imgs = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return imgs[0]?.url ?? "/images/sample-saude.jpg";
}

export const PENDING = "[preencher no admin]";
