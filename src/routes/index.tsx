import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { icons, ShieldCheck, Store, Truck, Stethoscope, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { bannersQuery, categoriesQuery, productsByIdsQuery, settingsQuery, showcaseProductsQuery, showcasesQuery } from "@/lib/store-data";
import { ProductRail } from "@/components/store/ProductRail";
import { whatsappLink } from "@/components/store/Extras";
import { getRecentlyViewed } from "@/lib/cart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drogaria Franco — Farmácia online com preço baixo" },
      { name: "description", content: "Compre medicamentos, genéricos, dermocosméticos e itens de higiene na Drogaria Franco. Retire na loja ou receba em casa." },
      { property: "og:title", content: "Drogaria Franco — Farmácia online" },
      { property: "og:description", content: "Medicamentos, genéricos e dermocosméticos com ofertas toda semana." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <BannerCarousel />
      <CategoryShortcuts />
      <Showcases />
      <RecentlyViewed />
      <Benefits />
      <PharmacistBlock />
      <Newsletter />
    </>
  );
}

function BannerCarousel() {
  const { data: banners = [] } = useQuery(bannersQuery);
  const [ref, api] = useEmblaCarousel({ loop: true });
  useEffect(() => {
    if (!api) return;
    const t = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(t);
  }, [api]);
  if (!banners.length) return <div className="aspect-[5/2] w-full animate-pulse bg-muted md:aspect-[5/1.6]" />;
  return (
    <section className="relative">
      <div ref={ref} className="overflow-hidden">
        <div className="flex">
          {banners.map((b, i) => (
            <a key={b.id} href={b.link ?? "/"} className="relative min-w-0 flex-[0_0_100%]">
              <picture>
                <source media="(max-width: 767px)" srcSet={b.image_mobile ?? b.image_desktop ?? ""} />
                <img src={b.image_desktop ?? ""} alt={b.title ?? "Banner"} className="aspect-[5/2.4] w-full object-cover md:aspect-[5/1.6]" loading={i === 0 ? "eager" : "lazy"} />
              </picture>
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 md:px-16">
                  <div className="max-w-xs md:max-w-md">
                    <h2 className="text-2xl font-extrabold text-secondary md:text-5xl">{b.title}</h2>
                    <p className="mt-2 text-sm text-secondary md:text-lg">{b.subtitle}</p>
                    <span className="mt-4 inline-block rounded-full bg-primary-strong px-5 py-2 text-sm font-bold text-primary-foreground">Aproveitar</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <button aria-label="Anterior" onClick={() => api?.scrollPrev()} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/80 p-2 md:block"><ChevronLeft className="h-5 w-5" /></button>
      <button aria-label="Próximo" onClick={() => api?.scrollNext()} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/80 p-2 md:block"><ChevronRight className="h-5 w-5" /></button>
    </section>
  );
}

function CategoryShortcuts() {
  const { data: cats = [] } = useQuery(categoriesQuery);
  const roots = cats.filter((c) => !c.parent_id && c.active);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 md:justify-center md:gap-8">
        {roots.map((c) => {
          const Icon = icons[(c.icon ?? "Pill") as keyof typeof icons] ?? icons.Pill;
          return (
            <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center md:w-24">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong transition group-hover:bg-primary group-hover:text-primary-foreground md:h-20 md:w-20">
                <Icon className="h-7 w-7 md:h-8 md:w-8" />
              </span>
              <span className="text-xs font-semibold leading-tight md:text-sm">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Showcase({ sc }: { sc: { id: string; title: string; rule: string; rule_value: string | null; product_ids: string[] } }) {
  const { data = [], isLoading } = useQuery(showcaseProductsQuery(sc));
  return <ProductRail title={sc.title} products={data} loading={isLoading} />;
}

function Showcases() {
  const { data: list = [] } = useQuery(showcasesQuery);
  return (
    <>
      {list.map((sc, i) => (
        <div key={sc.id} className={i % 2 === 1 ? "bg-surface" : ""}>
          <Showcase sc={sc} />
        </div>
      ))}
    </>
  );
}

function RecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getRecentlyViewed()), []);
  const { data = [] } = useQuery(productsByIdsQuery(ids));
  return <ProductRail title="Vistos recentemente" products={data} />;
}

function Benefits() {
  const items = [
    { icon: Truck, t: "Entrega rápida", d: "Receba em casa" },
    { icon: Store, t: "Retire na loja", d: "Sem custo de frete" },
    { icon: ShieldCheck, t: "Pagamento seguro", d: "Pix e cartão" },
    { icon: Stethoscope, t: "Atendimento farmacêutico", d: "Tire suas dúvidas" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <I className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold">{t}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PharmacistBlock() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">Fale com nosso farmacêutico</h2>
          <p className="mt-1 opacity-90">Dúvidas sobre medicamentos, interações ou posologia? Estamos aqui para ajudar.</p>
        </div>
        <a href={whatsappLink(s?.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-background px-6 py-3 font-bold text-primary-strong">
          <MessageCircle className="h-5 w-5" /> Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
}

function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-2xl bg-surface p-6 md:p-10">
        <h2 className="text-xl font-extrabold text-secondary md:text-2xl">Receba ofertas exclusivas</h2>
        <p className="text-sm text-muted-foreground">Cadastre-se e fique por dentro das promoções da Drogaria Franco.</p>
        <form
          className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!consent) return void toast.error("Aceite receber comunicações para continuar.");
            setBusy(true);
            const { error } = await supabase.from("newsletter_subscribers").insert({ name, email, consent });
            setBusy(false);
            if (error) toast.error(error.code === "23505" ? "Este e-mail já está cadastrado." : "Não foi possível cadastrar.");
            else {
              toast.success("Cadastro realizado!");
              setName("");
              setEmail("");
              setConsent(false);
            }
          }}
        >
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="h-11 rounded-lg border bg-background px-3" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" className="h-11 rounded-lg border bg-background px-3" />
          <button disabled={busy} className="h-11 rounded-lg bg-primary-strong px-6 font-bold text-primary-foreground">Cadastrar</button>
          <label className="flex items-start gap-2 text-xs text-muted-foreground md:col-span-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            Concordo em receber comunicações da Drogaria Franco e com a Política de Privacidade, conforme a LGPD.
          </label>
        </form>
      </div>
    </section>
  );
}
