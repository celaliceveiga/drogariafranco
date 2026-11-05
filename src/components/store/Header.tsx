import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, MapPin, Menu, Package, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-horizontal.png.asset.json";
import { useCart } from "@/lib/cart";
import { categoriesQuery, settingsQuery, type Category } from "@/lib/store-data";
import { useAuthUser } from "@/lib/auth";
import { SearchBox } from "./SearchBox";

function TopBar() {
  const { data: s } = useQuery(settingsQuery);
  const msgs = [
    `Frete grátis acima de R$ ${Number(s?.free_shipping_min ?? 99).toFixed(0)}`,
    "Retire na loja",
    "Compre pelo WhatsApp",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 3500);
    return () => clearInterval(t);
  }, [msgs.length]);
  return (
    <div className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-xs font-semibold">
        <span key={i} className="animate-in fade-in">{msgs[i]}</span>
      </div>
    </div>
  );
}

function CepField() {
  const [cep, setCep] = useState("");
  const [editing, setEditing] = useState(false);
  useEffect(() => setCep(localStorage.getItem("df_cep") ?? ""), []);
  if (editing)
    return (
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem("df_cep", cep);
          setEditing(false);
        }}
      >
        <input autoFocus value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000000" className="w-24 rounded px-2 py-0.5 text-xs text-foreground" />
        <button className="text-xs font-bold underline">OK</button>
      </form>
    );
  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs opacity-90 hover:opacity-100">
      <MapPin className="h-3.5 w-3.5" />
      {cep ? `Entregar em ${cep.replace(/(\d{5})(\d{3})/, "$1-$2")}` : "Informe seu CEP"}
    </button>
  );
}

export function Header() {
  const cart = useCart();
  const user = useAuthUser();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const roots = cats.filter((c) => !c.parent_id && c.active);
  const [drawer, setDrawer] = useState(false);

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <TopBar />
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-6">
          <button className="md:hidden" aria-label="Abrir menu" onClick={() => setDrawer(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="shrink-0" aria-label="Drogaria Franco - início">
            <img src={logo.url} alt="Drogaria Franco" className="h-10 w-auto md:h-12" />
          </Link>
          <div className="order-last w-full md:order-none md:flex-1">
            <SearchBox />
            <div className="mt-1 hidden md:block"><CepField /></div>
          </div>
          <nav className="ml-auto flex items-center gap-4 text-sm font-semibold">
            <Link to={user ? "/conta" : "/auth"} className="hidden items-center gap-1.5 lg:flex">
              <User className="h-5 w-5" /> {user ? "Minha conta" : "Entrar"}
            </Link>
            <Link to="/conta" className="hidden items-center gap-1.5 lg:flex">
              <Package className="h-5 w-5" /> Meus pedidos
            </Link>
            <Link to={user ? "/conta" : "/auth"} className="lg:hidden" aria-label="Conta"><User className="h-6 w-6" /></Link>
            <button onClick={() => cart.setOpen(true)} className="relative flex items-center gap-1.5" aria-label="Carrinho">
              <ShoppingCart className="h-6 w-6" />
              {cart.count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rx px-1 text-[11px] font-bold text-rx-foreground">{cart.count}</span>
              )}
            </button>
          </nav>
        </div>
      </div>
      <nav className="hidden border-b bg-background md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm font-semibold">
          {roots.map((c) => (
            <MegaItem key={c.id} cat={c} subs={cats.filter((s) => s.parent_id === c.id && s.active)} />
          ))}
          <li>
            <Link to="/busca" search={{ q: "", ofertas: true }} className="block px-3 py-3 text-rx">Ofertas</Link>
          </li>
        </ul>
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-background p-4 text-foreground">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Categorias</span>
              <button aria-label="Fechar" onClick={() => setDrawer(false)}><X className="h-5 w-5" /></button>
            </div>
            <CepFieldMobile />
            {roots.map((c) => (
              <details key={c.id} className="border-b py-2">
                <summary className="cursor-pointer list-none font-semibold">{c.name}</summary>
                <ul className="mt-2 space-y-2 pl-3 text-sm">
                  <li><Link to="/categoria/$slug" params={{ slug: c.slug }} onClick={() => setDrawer(false)} className="text-primary-strong">Ver tudo</Link></li>
                  {cats.filter((s) => s.parent_id === c.id).map((s) => (
                    <li key={s.id}><Link to="/categoria/$slug" params={{ slug: s.slug }} onClick={() => setDrawer(false)}>{s.name}</Link></li>
                  ))}
                </ul>
              </details>
            ))}
            <Link to="/busca" search={{ q: "", ofertas: true }} onClick={() => setDrawer(false)} className="block py-3 font-semibold text-rx">Ofertas</Link>
          </aside>
        </div>
      )}
    </header>
  );
}

function CepFieldMobile() {
  return <div className="mb-3 rounded-lg bg-primary p-2 text-primary-foreground"><CepField /></div>;
}

function MegaItem({ cat, subs }: { cat: Category; subs: Category[] }) {
  return (
    <li className="group relative">
      <Link to="/categoria/$slug" params={{ slug: cat.slug }} className="flex items-center gap-1 px-3 py-3 hover:text-primary-strong">
        {cat.name} {subs.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
      </Link>
      {subs.length > 0 && (
        <div className="invisible absolute left-0 top-full z-50 min-w-56 rounded-b-xl border bg-popover p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
          {subs.map((s) => (
            <Link key={s.id} to="/categoria/$slug" params={{ slug: s.slug }} className="block rounded-md px-3 py-2 font-normal hover:bg-accent hover:text-accent-foreground">
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
