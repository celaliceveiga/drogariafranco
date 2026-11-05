import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined }),
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta | Drogaria Franco" },
      { name: "description", content: "Acesse sua conta na Drogaria Franco para acompanhar pedidos." },
      { property: "og:title", content: "Entrar | Drogaria Franco" },
      { property: "og:description", content: "Acesse sua conta na Drogaria Franco." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: next ?? "/conta" });
      } else if (mode === "signup") {
        if (!terms) throw new Error("Aceite os termos e a política de privacidade.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Enviamos um link para redefinir sua senha.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  const input = "h-11 w-full rounded-lg border px-3";
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-extrabold text-secondary">{mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Esqueci minha senha"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "signup" && <input required placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className={input} />}
        <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        {mode !== "forgot" && <input required type="password" minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />}
        {mode === "signup" && (
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
            Li e aceito os Termos de uso e a Política de privacidade (LGPD).
          </label>
        )}
        <button disabled={busy} className="h-11 w-full rounded-lg bg-primary-strong font-bold text-primary-foreground">
          {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        {mode !== "login" ? (
          <button onClick={() => setMode("login")} className="text-primary-strong">Já tenho conta</button>
        ) : (
          <>
            <button onClick={() => setMode("signup")} className="text-primary-strong">Criar conta</button>
            <button onClick={() => setMode("forgot")} className="text-muted-foreground">Esqueci minha senha</button>
          </>
        )}
      </div>
    </div>
  );
}
