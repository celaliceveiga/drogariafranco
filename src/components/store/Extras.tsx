import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { settingsQuery } from "@/lib/store-data";

export function whatsappLink(num?: string | null, text = "Olá! Vim pelo site da Drogaria Franco.") {
  const n = (num ?? "").replace(/\D/g, "");
  return n ? `https://wa.me/${n.startsWith("55") ? n : "55" + n}?text=${encodeURIComponent(text)}` : "#";
}

export function WhatsAppFab() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <a
      href={whatsappLink(s?.whatsapp)}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!localStorage.getItem("df_cookies")), []);
  if (!show) return null;
  const choose = (v: string) => {
    localStorage.setItem("df_cookies", v);
    setShow(false);
  };
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border bg-background p-4 shadow-2xl md:flex md:items-center md:gap-4">
      <p className="text-sm text-muted-foreground">
        Usamos cookies essenciais para o site funcionar e, com sua permissão, cookies para melhorar sua experiência (LGPD).
      </p>
      <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
        <button onClick={() => choose("essential")} className="rounded-lg border px-3 py-2 text-sm font-semibold">Recusar não essenciais</button>
        <button onClick={() => choose("all")} className="rounded-lg bg-primary-strong px-3 py-2 text-sm font-bold text-primary-foreground">Aceitar</button>
      </div>
    </div>
  );
}
