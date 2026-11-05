import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderTree, LayoutDashboard, LogOut, Menu, Package, Store, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-horizontal.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Painel | Drogaria Franco" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-gate"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { user: null, admin: false };
      const { data: ok } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return { user: u.user, admin: ok === true };
    },
  });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Carregando…</div>;
  if (!data?.user) return <AdminLogin />;
  if (!data.admin)
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="font-semibold">Sua conta não tem acesso ao painel.</p>
        <Link to="/" className="mt-4 inline-block text-primary-strong underline">Voltar à loja</Link>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between bg-primary p-4">
          <img src={logo.url} alt="Drogaria Franco" className="h-9 w-auto" />
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Fechar"><X className="h-5 w-5 text-primary-foreground" /></button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map(({ to, label, icon: I }) => {
            const active = to === "/admin" ? path === "/admin" : path.startsWith(to);
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <I className="h-4 w-4" /> {label}
              </Link>
            );
          })}
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><Store className="h-4 w-4" /> Ver loja</Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <span className="font-bold">Painel</span>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <form
        className="w-full max-w-sm rounded-2xl bg-background p-8 shadow-2xl"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
          if (error) setErr(error.message);
          else window.location.reload();
        }}
      >
        <div className="mb-6 rounded-xl bg-primary p-3"><img src={logo.url} alt="Drogaria Franco" className="mx-auto h-12 w-auto" /></div>
        <h1 className="mb-4 text-center text-lg font-bold">Painel administrativo</h1>
        <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-3 h-11 w-full rounded-lg border px-3" />
        <input required type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} className="mb-3 h-11 w-full rounded-lg border px-3" />
        {err && <p className="mb-3 text-sm text-destructive">{err}</p>}
        <button className="h-11 w-full rounded-lg bg-primary-strong font-bold text-primary-foreground">Entrar</button>
        <p className="mt-4 text-center text-xs text-muted-foreground">A primeira conta criada no site vira administradora automaticamente.</p>
      </form>
    </div>
  );
}
