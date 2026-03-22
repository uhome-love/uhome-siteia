import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  RefreshCw,
  PenSquare,
  Settings,
  LogOut,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Home, label: "Imóveis", path: "/admin/imoveis" },
  { icon: Users, label: "Leads", path: "/admin/leads" },
  { icon: FileText, label: "Captações", path: "/admin/captacoes" },
  { icon: RefreshCw, label: "Sync Jetimob", path: "/admin/sync" },
  { icon: PenSquare, label: "Integração CRM", path: "/admin/integracao" },
  { icon: Settings, label: "Configurações", path: "/admin/config" },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">Acesso negado</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            U
          </div>
          <span className="text-sm font-bold tracking-tight">Painel Admin</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
            {user?.email}
          </div>
          <button
            onClick={() => signOut().then(() => navigate("/"))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
