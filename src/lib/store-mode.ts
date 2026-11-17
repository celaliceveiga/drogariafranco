// Interruptor da venda de medicamentos.
// false = a loja mostra só cosméticos, dermocosméticos, higiene e afins: as categorias e os
// produtos de medicamentos ficam escondidos do site (continuam no banco e no admin).
// Para voltar a vender medicamentos, troque para true.
export const MEDICINES_ENABLED: boolean = false;

// Categorias-raiz de medicamentos (as subcategorias delas somem junto).
const MEDICINE_ROOT_SLUGS = ["medicamentos"];

export function isMedicine(p: { kind: string; sale_class: string }) {
  return p.kind === "medicamento" || p.sale_class !== "livre";
}

/** Tira os medicamentos de uma lista de produtos quando a venda está desligada. */
export function sellable<T extends { kind: string; sale_class: string }>(list: T[]): T[] {
  return MEDICINES_ENABLED ? list : list.filter((p) => !isMedicine(p));
}

/** Tira as categorias de medicamentos (e as filhas) quando a venda está desligada. */
export function storeCategories<T extends { id: string; parent_id: string | null; slug: string }>(
  cats: T[],
): T[] {
  if (MEDICINES_ENABLED) return cats;
  const hidden = new Set(cats.filter((c) => MEDICINE_ROOT_SLUGS.includes(c.slug)).map((c) => c.id));
  return cats.filter((c) => !hidden.has(c.id) && !(c.parent_id && hidden.has(c.parent_id)));
}
