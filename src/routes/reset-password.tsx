import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | Drogaria Franco" },
      { name: "description", content: "Crie uma nova senha para sua conta Drogaria Franco." },
      { property: "og:title", content: "Redefinir senha | Drogaria Franco" },
      { property: "og:description", content: "Crie uma nova senha." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-extrabold text-secondary">Nova senha</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) toast.error(error.message);
          else {
            toast.success("Senha atualizada!");
            navigate({ to: "/conta" });
          }
        }}
      >
        <input required type="password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Nova senha" className="h-11 w-full rounded-lg border px-3" />
        <button className="h-11 w-full rounded-lg bg-primary-strong font-bold text-primary-foreground">Salvar</button>
      </form>
    </div>
  );
}
