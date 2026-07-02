import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogOut, Ticket, Receipt, Heart, User, CreditCard, ChevronLeft } from "lucide-react";
import { useAuth, requestLogin } from "@/lib/auth";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta | FastTicket.com" }] }),
  component: CuentaLayout,
});

const TABS = [
  { to: "/cuenta/boletos", label: "Mis boletos", Icon: Ticket },
  { to: "/cuenta/historial", label: "Historial", Icon: Receipt },
  { to: "/cuenta/favoritos", label: "Favoritos", Icon: Heart },
  { to: "/cuenta/datos", label: "Datos personales", Icon: User },
  { to: "/cuenta/pagos", label: "Métodos de pago", Icon: CreditCard },
] as const;

function CuentaLayout() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Route guard: no session -> bounce home and pop the login modal open.
  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/" });
      requestLogin();
      toast.error("Inicia sesión para ver tu cuenta");
    }
  }, [ready, user, navigate]);

  if (!ready || !user) return null;

  return (
    <div className="min-h-screen bg-app text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-app/95 backdrop-blur z-10">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <Link to="/" className="text-xl font-black">
          FastTicket<span className="text-pink">.com</span>
        </Link>
        <div className="w-16" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-card-purple border border-white/10 rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-3 pb-4 mb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full gradient-pink-purple flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>

          <nav className="space-y-0.5">
            {TABS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                  pathname === to ? "bg-pink text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                toast.success("Sesión cerrada");
                navigate({ to: "/" });
              }}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
