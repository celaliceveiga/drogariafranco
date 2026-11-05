import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha conta | Drogaria Franco" },
      { name: "description", content: "Seus dados e pedidos na Drogaria Franco." },
      { property: "og:title", content: "Minha conta | Drogaria Franco" },
      { property: "og:description", content: "Seus dados e pedidos." },
    ],
  }),
  component: Account,
});

function Account() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" })).data === true,
  });
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p>Entre para ver sua conta e seus pedidos.</p>
        <Link to="/auth" className="mt-4 inline-block rounded-lg bg-primary-strong px-6 py-2 font-bold text-primary-foreground">Entrar</Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-secondary">Minha conta</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>
      <div className="mt-6 rounded-xl border p-5">
        <h2 className="font-bold">Meus pedidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Você ainda não tem pedidos. O acompanhamento completo chega na próxima etapa.</p>
      </div>
      <div className="mt-6 flex gap-3">
        {isAdmin && <Link to="/admin" className="rounded-lg bg-secondary px-4 py-2 font-bold text-secondary-foreground">Painel administrativo</Link>}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="rounded-lg border px-4 py-2 font-semibold"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
