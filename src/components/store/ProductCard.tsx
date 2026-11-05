import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Bell, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { brl, discountPercent, effectivePrice, installments, isPromoActive } from "@/lib/pricing";
import { mainImage, settingsQuery, type StoreProduct } from "@/lib/store-data";

export function ProductCard({ p }: { p: StoreProduct }) {
  const { data: settings } = useQuery(settingsQuery);
  const cart = useCart();
  const qty = cart.qtyOf(p.id);
  const price = effectivePrice(p);
  const off = discountPercent(p);
  const inst = installments(price, settings?.max_installments ?? 3, Number(settings?.min_installment ?? 20));
  const low = settings?.low_stock_threshold ?? p.min_stock;
  const out = p.stock <= 0;
  const controlled = p.sale_class === "controlado";

  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-3 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)]">
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="relative block aspect-square overflow-hidden rounded-lg bg-background">
        <img src={mainImage(p)} alt={p.name} loading="lazy" className="h-full w-full object-contain transition group-hover:scale-105" />
        <div className="absolute left-1 top-1 flex flex-col gap-1">
          {off > 0 && <span className="rounded-md bg-success px-1.5 py-0.5 text-xs font-bold text-success-foreground">-{off}%</span>}
          {p.is_generic && <span className="rounded-md bg-warning px-1.5 py-0.5 text-[10px] font-bold uppercase text-warning-foreground">Genérico</span>}
        </div>
        {p.sale_class === "receita" && (
          <span className="absolute right-1 top-1 rounded-md bg-rx px-1.5 py-0.5 text-[10px] font-bold uppercase text-rx-foreground">Exige receita</span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
        <Link to="/produto/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary-strong">
          {p.name}
        </Link>
        {p.presentation && <p className="text-xs text-muted-foreground">{p.presentation}</p>}

        <div className="mt-auto pt-2">
          {isPromoActive(p) && <p className="text-xs text-muted-foreground line-through">{brl(Number(p.price))}</p>}
          <p className="text-xl font-extrabold text-secondary">{brl(price)}</p>
          {inst && <p className="text-xs text-muted-foreground">ou {inst.count}x de {brl(inst.value)} sem juros</p>}
          {!out && p.stock <= low && <p className="mt-1 text-xs font-semibold text-warning">Últimas unidades</p>}
        </div>

        <div className="mt-3">
          {controlled ? (
            <p className="flex items-center justify-center gap-1.5 rounded-lg bg-muted px-2 py-2 text-xs font-semibold text-muted-foreground">
              <Store className="h-4 w-4" /> Disponível na loja física
            </p>
          ) : out ? (
            <NotifyMe productId={p.id} />
          ) : qty > 0 ? (
            <div className="flex items-center justify-between rounded-lg border-2 border-primary-strong">
              <button aria-label="Diminuir" className="p-2 text-primary-strong" onClick={() => cart.setQty(p.id, qty - 1)}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold">{qty}</span>
              <button
                aria-label="Aumentar"
                className="p-2 text-primary-strong disabled:opacity-40"
                disabled={qty >= p.stock}
                onClick={() => cart.setQty(p.id, qty + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                cart.add(p.id);
                toast.success("Adicionado ao carrinho");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-strong px-3 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-secondary"
            >
              <ShoppingCart className="h-4 w-4" /> Adicionar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function NotifyMe({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  if (!open)
    return (
      <div className="space-y-1">
        <p className="text-center text-xs font-semibold text-muted-foreground">Indisponível</p>
        <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary-strong px-3 py-2 text-sm font-bold text-primary-strong">
          <Bell className="h-4 w-4" /> Avise-me
        </button>
      </div>
    );
  return (
    <form
      className="flex gap-1"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.from("stock_alerts").insert({ product_id: productId, email });
        if (error) toast.error("Não foi possível registrar");
        else {
          toast.success("Avisaremos quando chegar!");
          setOpen(false);
        }
      }}
    >
      <input required type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 rounded-lg border px-2 text-sm" />
      <button className="rounded-lg bg-primary-strong px-3 text-sm font-bold text-primary-foreground">OK</button>
    </form>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border p-3">
      <div className="aspect-square animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-10 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
