export type PricedProduct = {
  price: number;
  promo_price: number | null;
  promo_start?: string | null;
  promo_end?: string | null;
};

export function isPromoActive(p: PricedProduct, now = new Date()): boolean {
  if (p.promo_price == null || Number(p.promo_price) >= Number(p.price)) return false;
  if (p.promo_start && new Date(p.promo_start) > now) return false;
  if (p.promo_end && new Date(p.promo_end) < now) return false;
  return true;
}

export function effectivePrice(p: PricedProduct, now = new Date()): number {
  return isPromoActive(p, now) ? Number(p.promo_price) : Number(p.price);
}

export function discountPercent(p: PricedProduct, now = new Date()): number {
  if (!isPromoActive(p, now)) return 0;
  return Math.round((1 - Number(p.promo_price) / Number(p.price)) * 100);
}

/** Interest-free installments: up to maxInstallments, each at least minInstallment. */
export function installments(total: number, maxInstallments: number, minInstallment: number) {
  let n = Math.min(maxInstallments, Math.floor(total / minInstallment));
  if (n < 2) return null;
  return { count: n, value: total / n };
}

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
