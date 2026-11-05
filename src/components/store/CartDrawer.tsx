import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl, effectivePrice } from "@/lib/pricing";
import { mainImage, productsByIdsQuery, settingsQuery } from "@/lib/store-data";

export function CartDrawer() {
  const cart = useCart();
  const { data: products = [] } = useQuery(productsByIdsQuery(cart.lines.map((l) => l.id)));
  const { data: s } = useQuery(settingsQuery);
  if (!cart.open) return null;
  const subtotal = cart.lines.reduce((sum, l) => {
    const p = products.find((x) => x.id === l.id);
    return sum + (p ? effectivePrice(p) * l.qty : 0);
  }, 0);
  const freeMin = Number(s?.free_shipping_min ?? 99);
  const missing = Math.max(0, freeMin - subtotal);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => cart.setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-[420px] max-w-full flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">Meu carrinho ({cart.count})</h2>
          <button aria-label="Fechar" onClick={() => cart.setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b bg-primary-soft p-4 text-sm">
          {missing > 0 ? <>Faltam <strong>{brl(missing)}</strong> para frete grátis</> : <strong className="text-success">Você ganhou frete grátis!</strong>}
          <div className="mt-2 h-2 rounded-full bg-background">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (subtotal / freeMin) * 100)}%` }} />
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cart.lines.length === 0 && <p className="py-10 text-center text-muted-foreground">Seu carrinho está vazio.</p>}
          {cart.lines.map((l) => {
            const p = products.find((x) => x.id === l.id);
            if (!p) return null;
            return (
              <div key={l.id} className="flex gap-3 rounded-lg border p-2">
                <img src={mainImage(p)} alt="" className="h-16 w-16 rounded object-contain" />
                <div className="flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                  {p.sale_class === "receita" && <p className="text-xs font-semibold text-rx">Exige receita</p>}
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-md border">
                      <button aria-label="Diminuir" className="p-1" onClick={() => cart.setQty(p.id, l.qty - 1)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="text-sm font-bold">{l.qty}</span>
                      <button aria-label="Aumentar" className="p-1" disabled={l.qty >= p.stock} onClick={() => cart.setQty(p.id, l.qty + 1)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="font-bold text-secondary">{brl(effectivePrice(p) * l.qty)}</span>
                  </div>
                </div>
                <button aria-label="Remover" onClick={() => cart.setQty(p.id, 0)} className="self-start text-muted-foreground hover:text-rx"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
        <div className="border-t p-4">
          <div className="mb-3 flex justify-between text-lg font-bold"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
          <button disabled className="w-full rounded-lg bg-primary-strong py-3 font-bold text-primary-foreground opacity-60" title="Checkout chega na próxima etapa">
            Finalizar compra (em breve)
          </button>
        </div>
      </aside>
    </div>
  );
}
