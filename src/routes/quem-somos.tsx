import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Building2, CalendarDays, MapPin } from "lucide-react";
import { PENDING, settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem somos | Drogaria Franco" },
      { name: "description", content: "Conheça a Drogaria Franco: G. M. Franco Drogaria, CNPJ 04.574.777/0001-10, desde 2001 em Feira Nova do Maranhão - MA." },
      { property: "og:title", content: "Quem somos | Drogaria Franco" },
      { property: "og:description", content: "Farmácia com CNPJ ativo desde 2001 em Feira Nova do Maranhão - MA." },
    ],
  }),
  component: About,
});

function About() {
  const { data: s } = useQuery(settingsQuery);
  const rows = [
    { icon: Building2, k: "Razão social", v: s?.legal_name },
    { icon: BadgeCheck, k: "CNPJ", v: s?.cnpj ? `${s.cnpj} — situação cadastral ativa` : null },
    { icon: CalendarDays, k: "Fundação", v: s?.founded },
    { icon: MapPin, k: "Endereço", v: s?.address },
    { icon: BadgeCheck, k: "Atividade (CNAE)", v: s?.cnae },
    { icon: BadgeCheck, k: "Farmacêutico(a) responsável", v: s?.pharmacist ? `${s.pharmacist} — CRF ${s.crf ?? PENDING}` : null },
    { icon: BadgeCheck, k: "AFE (ANVISA)", v: s?.afe },
    { icon: BadgeCheck, k: "Licença sanitária", v: s?.sanitary_license },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-secondary">Quem somos</h1>
      <p className="mt-3 text-muted-foreground">
        A Drogaria Franco atende Feira Nova do Maranhão desde 2001 com compromisso com a sua saúde: medicamentos, genéricos, dermocosméticos e
        atendimento farmacêutico de confiança — agora também online.
      </p>
      <h2 className="mt-8 text-xl font-bold">Dados da empresa</h2>
      <dl className="mt-3 divide-y rounded-xl border">
        {rows.map(({ icon: I, k, v }) => (
          <div key={k} className="flex gap-3 p-4">
            <I className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
              <dd className="text-sm">{v || PENDING}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
