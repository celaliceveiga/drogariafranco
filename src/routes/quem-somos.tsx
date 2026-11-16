import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Handshake,
  Heart,
  Home,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Table,
  Users,
} from "lucide-react";
import { PENDING, settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem somos | Drogaria Franco" },
      {
        name: "description",
        content:
          "Conheça a Drogaria Franco: G. M. Franco Drogaria, CNPJ 04.574.777/0001-10, desde 2001 em Feira Nova do Maranhão - MA.",
      },
      { property: "og:title", content: "Quem somos | Drogaria Franco" },
      {
        property: "og:description",
        content:
          "Tradição, confiança e cuidado em cada detalhe. Desde 2001 em Feira Nova do Maranhão - MA.",
      },
    ],
  }),
  component: About,
});

const values = [
  { icon: ShieldCheck, t: "Qualidade", d: "Produtos de procedência e marcas reconhecidas." },
  {
    icon: Users,
    t: "Atendimento humanizado",
    d: "Orientação com responsabilidade e respeito às suas necessidades.",
  },
  { icon: Handshake, t: "Confiança", d: "Uma relação sólida com nossos clientes." },
  { icon: Heart, t: "Cuidado integral", d: "Saúde, bem-estar e beleza em um só lugar." },
];

function About() {
  const { data: s } = useQuery(settingsQuery);
  const rows = [
    { icon: Building2, k: "Razão Social", v: s?.legal_name },
    { icon: BadgeCheck, k: "CNPJ", v: s?.cnpj ? `${s.cnpj} — situação cadastral ativa` : null },
    { icon: CalendarDays, k: "Fundação", v: s?.founded },
    { icon: MapPin, k: "Endereço", v: s?.address },
    { icon: Table, k: "Atividade (CNAE)", v: s?.cnae },
    {
      icon: Stethoscope,
      k: "Farmacêutico(a) responsável",
      v: s?.pharmacist ? `${s.pharmacist} — CRF ${s.crf ?? PENDING}` : null,
    },
    { icon: BadgeCheck, k: "AFE (ANVISA)", v: s?.afe },
    { icon: BadgeCheck, k: "Licença sanitária", v: s?.sanitary_license },
  ];
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-4 pt-6 md:grid-cols-[5fr_6fr] md:gap-10 md:pt-8">
        <div>
          <nav
            aria-label="Você está em"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              to="/"
              aria-label="Página inicial"
              className="text-primary-strong hover:text-primary"
            >
              <Home className="h-4 w-4" />
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-secondary">
              Quem Somos
            </span>
          </nav>
          <h1 className="mt-4 text-4xl font-extrabold text-secondary md:text-5xl">Quem Somos</h1>
          <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-primary" />
          <h2 className="mt-5 text-2xl font-extrabold leading-tight text-primary-strong md:text-3xl">
            Tradição, confiança e <br className="hidden sm:block" />
            cuidado em cada detalhe.
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed">
            <p>
              Desde 2001, a <strong className="font-bold">Drogaria Franco</strong> está no mercado
              construindo uma trajetória marcada pela confiança, respeito e compromisso com a saúde
              e o bem-estar de seus clientes.
            </p>
            <p>
              Acreditamos que cuidar vai muito além de oferecer produtos. É acolher, orientar com
              responsabilidade e estabelecer relações de confiança que se fortalecem ao longo do
              tempo.
            </p>
            <p>
              Por isso, reunimos medicamentos, produtos de saúde, higiene, beleza e dermocosméticos
              cuidadosamente selecionados, sempre valorizando a qualidade, a segurança e as
              necessidades de quem confia em nós.
            </p>
            <p>
              Nossa essência está na combinação entre tradição, atendimento humanizado e compromisso
              com a excelência, proporcionando uma experiência de cuidado pautada na atenção, no
              respeito e na credibilidade.
            </p>
          </div>
        </div>
        <img
          src="/images/quem-somos-marca.jpg"
          alt="Marca da Drogaria Franco com o slogan Compromisso com sua saúde"
          width={1920}
          height={1080}
          className="aspect-video w-full rounded-3xl object-cover shadow-card"
        />
      </section>

      <section aria-label="Nossos valores" className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-0 md:divide-x">
          {values.map(({ icon: I, t, d }) => (
            <div key={t} className="flex flex-col items-center px-2 text-center md:px-6">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong md:h-20 md:w-20">
                <I className="h-7 w-7 md:h-8 md:w-8" />
              </span>
              <h3 className="mt-3 text-base font-extrabold text-secondary md:text-lg">{t}</h3>
              <p className="mt-1 max-w-56 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid overflow-hidden rounded-2xl bg-primary-soft md:grid-cols-2 md:items-center">
          <img
            src="/images/quem-somos-dermocosmeticos.jpg"
            alt="Dermocosméticos: pote de creme, frasco com válvula, sérum e bisnaga sobre uma bancada"
            width={1920}
            height={1072}
            loading="lazy"
            className="h-56 w-full object-cover md:h-80"
          />
          <div className="p-6 md:p-10">
            <h2 className="border-l-4 border-primary pl-4 text-2xl font-extrabold leading-tight text-secondary md:pl-6 md:text-3xl">
              Saúde, beleza e bem-estar <br className="hidden lg:block" />
              para o seu dia a dia.
            </h2>
            <p className="mt-4 pl-5 md:pl-7 md:text-lg">
              Uma seleção completa de medicamentos, higiene, cuidados pessoais e dermocosméticos,
              com a qualidade e a confiança que você já conhece.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-6">
        <div className="grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <div className="flex items-center justify-center gap-3 bg-primary-soft p-6 text-primary-strong md:flex-col">
            <FileText className="h-8 w-8" />
            <h2 className="text-xl font-extrabold text-secondary md:text-2xl">Dados da empresa</h2>
          </div>
          <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2 md:p-8">
            {rows.map(({ icon: I, k, v }) => (
              <div key={k} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-primary-strong" />
                <div>
                  <dt className="text-sm font-bold text-secondary">{k}</dt>
                  <dd className="text-sm text-muted-foreground">{v || PENDING}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
