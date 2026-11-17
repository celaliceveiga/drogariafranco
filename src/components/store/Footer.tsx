import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Clock, CreditCard, Lock, Mail, MessageCircle, Phone, QrCode, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo-horizontal.png.asset.json";
import { PENDING, settingsQuery } from "@/lib/store-data";

export function Footer() {
  const { data: s } = useQuery(settingsQuery);
  const v = (x: string | null | undefined) => x || PENDING;
  return (
    <footer className="mt-16 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <img src={logo.url} alt="Drogaria Franco" className="h-12 w-auto rounded-md" loading="lazy" />
          <p className="mt-3 text-sm opacity-80">Compromisso com sua saúde desde 2001, em Feira Nova do Maranhão.</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Institucional</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/quem-somos" className="hover:underline">Quem somos</Link></li>
            <li><Link to="/quem-somos" className="hover:underline">Política de privacidade</Link></li>
            <li><Link to="/termos-de-uso" className="hover:underline">Termos de uso</Link></li>
            <li><Link to="/quem-somos" className="hover:underline">Trocas e devoluções</Link></li>
            <li><Link to="/quem-somos" className="hover:underline">Política de entrega</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Atendimento</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li className="flex gap-2"><MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {v(s?.whatsapp)}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> {v(s?.phone)}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" /> {v(s?.email)}</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0" /> {v(s?.hours)}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Pagamento e segurança</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1"><QrCode className="h-4 w-4" /> Pix</span>
            <span className="flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1"><CreditCard className="h-4 w-4" /> Cartão</span>
            <span className="flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1"><Lock className="h-4 w-4" /> Site seguro</span>
            <span className="flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1"><ShieldCheck className="h-4 w-4" /> CNPJ ativo</span>
          </div>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs leading-relaxed opacity-80">
          <p>
            <strong>{s?.legal_name ?? "G. M. Franco Drogaria"}</strong> (Drogaria Franco) — CNPJ {s?.cnpj ?? "04.574.777/0001-10"} — {s?.address ?? PENDING}
          </p>
          <p>
            Farmacêutico(a) responsável: {v(s?.pharmacist)} — CRF: {v(s?.crf)}
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Drogaria Franco. Imagens meramente ilustrativas. Preços e condições válidos para o site.</p>
        </div>
      </div>
    </footer>
  );
}
