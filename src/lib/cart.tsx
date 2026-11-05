import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = { id: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  qtyOf: (id: string) => number;
  setQty: (id: string, qty: number) => void;
  add: (id: string, qty?: number) => void;
  clear: () => void;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "df_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const setQty = useCallback(
    (id: string, qty: number) => {
      setLines((prev) => {
        const next = qty <= 0 ? prev.filter((l) => l.id !== id) : prev.some((l) => l.id === id) ? prev.map((l) => (l.id === id ? { ...l, qty } : l)) : [...prev, { id, qty }];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      setQty,
      add: (id, qty = 1) => setQty(id, (lines.find((l) => l.id === id)?.qty ?? 0) + qty),
      clear: () => persist([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      open,
      setOpen,
    }),
    [lines, open, setQty],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

const RV = "df_recent";
export function pushRecentlyViewed(id: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(RV) ?? "[]");
    localStorage.setItem(RV, JSON.stringify([id, ...list.filter((x) => x !== id)].slice(0, 12)));
  } catch {}
}
export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RV) ?? "[]");
  } catch {
    return [];
  }
}
