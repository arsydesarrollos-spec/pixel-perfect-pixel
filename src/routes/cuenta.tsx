import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { LogOut, ChevronLeft } from "lucide-react";
import { useAuth, requestLogin } from "@/lib/auth";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta | Fastickett.com" }] }),
  component: CuentaLayout,
});

type Tab = { to: string; label: string; sub?: boolean };
type Group = { label?: string; tabs: Tab[] };

const GROUPS: Group[] = [
  {
    label: "Mis boletos",
    tabs: [
      { to: "/cuenta/boletos", label: "Próximos eventos", sub: true },
      { to: "/cuenta/pasados", label: "Eventos pasados", sub: true },
      { to: "/cuenta/ventas", label: "Mis ventas", sub: true },
    ],
  },
  { tabs: [{ to: "/cuenta/historial", label: "Historial" }] },
  {
    label: "Mi perfil",
    tabs: [
      { to: "/cuenta/datos", label: "Datos personales", sub: true },
      { to: "/cuenta/creditos", label: "Créditos", sub: true },
    ],
  },
  { tabs: [{ to: "/cuenta/facturacion", label: "Facturación" }] },
 { tabs: [{ to: "/cuenta/pagos", label: "Métodos de pago" }] },
  {
    label: "Organizador",
    tabs: [
      { to: "/organizador", label: "Panel de organizador", sub: true },
    ],
  },
  {
    label: "Configuración",
    tabs: [
      { to: "/cuenta/idioma", label: "Idioma", sub: true },
      { to: "/cuenta/notificaciones", label: "Notificaciones", sub: true },
    ],
  },
  {
    label: "Ayuda",
    tabs: [
      { to: "/cuenta/whatsapp", label: "WhatsApp", sub: true },
      { to: "/cuenta/redes", label: "Síguenos en redes", sub: true },
    ],
  },
];

function CuentaLayout() {
  const { user, ready, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/" });
      requestLogin();
      toast.error("Inicia sesión para ver tu cuenta");
    }
  }, [ready, user, navigate]);

  if (!ready || !user) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateUser({ photo: ev.target?.result as string });
      toast.success("Foto de perfil actualizada");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-app text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-app/95 backdrop-blur z-10">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <Link to="/" className="text-xl font-black">
          Fastickett<span className="text-pink">.com</span>
        </Link>
        <div className="w-16" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[272px_1fr] gap-9">
        <aside className="bg-card-purple border border-white/10 rounded-2xl p-5 h-fit md:sticky md:top-24">
          <div className="flex items-center gap-3 pb-4 mb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 group"
              aria-label="Cambiar foto de perfil"
            >
              {user.photo ? (
                <img src={user.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-pink-purple flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute inset-0 bg-black/60 text-[9px] font-bold text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                Cambiar<br />foto
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>

          <nav className="space-y-0.5">
            {GROUPS.map((group, gi) => (
              <div key={gi} className="mb-1">
                {group.label && (
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-3.5 pt-3 pb-1.5">
                    {group.label}
                  </div>
                )}
                {group.tabs.map((tab) => {
                  const active = pathname === tab.to;
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      className={`relative flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition ${
                        tab.sub ? "pl-7" : ""
                      } ${
                        active
                          ? "bg-pink/15 text-white font-bold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-pink before:rounded-l-lg"
                          : "text-gray-400 hover:bg-white/5 hover:text-white font-medium"
                      }`}
                    >
                      {tab.sub && (
                        <span
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${
                            active ? "bg-pink" : "bg-gray-600"
                          }`}
                        />
                      )}
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  logout();
                  toast.success("Sesión cerrada");
                  navigate({ to: "/" });
                }}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
