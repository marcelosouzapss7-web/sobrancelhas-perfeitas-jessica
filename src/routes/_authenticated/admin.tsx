import { createFileRoute, Link, Outlet, useNavigate, useRouterState, redirect } from "@tanstack/react-router";
import { Video, Image as ImageIcon, Users, Star, Images, LogOut, ShoppingBag, FileText, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin") {
      throw redirect({ to: "/admin/video" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu.");
    navigate({ to: "/auth" });
  };

  const items = [
    { to: "/admin/video", label: "Vídeo", icon: Video },
    { to: "/admin/banner", label: "Banner", icon: ImageIcon },
    { to: "/admin/referencias", label: "Referências", icon: Users },
    { to: "/admin/avaliacoes", label: "Avaliações", icon: Star },
    { to: "/admin/trabalhos", label: "Mais Imagens", icon: Images },
    { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
    { to: "/admin/arquivo", label: "Arquivo", icon: FileText },
    { to: "/admin/logo", label: "Logo Checkout", icon: ImagePlus },
  ] as const;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-card border-r border-gold/20 flex flex-col">
        <div className="p-6 border-b border-gold/20">
          <h2 className="font-serif text-xl text-gold">Admin</h2>
          <p className="text-xs text-muted-foreground mt-1">Sobrancelhas Perfeitas</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-gold/20 text-gold"
                    : "text-foreground/80 hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold/20">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
