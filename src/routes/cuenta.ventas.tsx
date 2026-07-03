// ============================================================================
// /cuenta/ventas — Mis ventas (panel del vendedor dentro de Mi cuenta)
// ----------------------------------------------------------------------------
// Resumen de ganancias + gestión de publicaciones: pausar, reactivar, eliminar.
// Se renderiza dentro del layout de cuenta.tsx (Outlet), como las demás tabs.
// ============================================================================
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BadgeCheck, Pause, Play, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useListings, sellerFees, type Listing } from "@/lib/listings";

export const Route = createFileRoute("/cuenta/ventas")({
  head: () => ({ meta: [{ title: "Mis ventas | Fastickett.com" }] }),
  component: VentasTab,
});

const STATUS_STYLE: Record<Listing["status"], string> = {
  activa: "text-green-400 bg-green-400/10 border-green-400/30",
  pausada: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  vendida: "text-gray-400 bg-white/5 border-white/15",
};

function VentasTab() {
  const { user } = useAuth();
  const listings = useListings();
  if (!user) return null;

  const mine = listings.mine(user.email);
  const activas = mine.filter((l) => l.status === "activa");
  const vendidas = mine.filter((l) => l.status === "vendida");
  // Ganancias estimadas: payout de todo lo ya vendido (mock)
  const ganancias = vendidas.reduce((s, l) => s + sellerFees(l.price).payout, 0);

  // Estado vacío propio (EmptyState enlaza a "/", aquí queremos ir a /vender)
  if (mine.length === 0) {
    return (
      <div className="text-center py-16 bg-card-purple rounded-2xl border border-white/10">
        <div className="text-5xl mb-4">💸</div>
        <p className="text-gray-400 mb-4 text-sm">Aún no has publicado boletos en venta.</p>
        <Link to="/vender" className="text-pink text-sm font-bold hover:underline">Vender mis boletos</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h2 className="text-xl font-black">Mis ventas</h2>
          <p className="text-sm text-gray-400">Gestiona tus boletos publicados</p>
        </div>
        <Link to="/vender" className="px-4 py-2 rounded-lg bg-pink text-white font-bold text-sm hover:opacity-90 transition flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Publicar
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 my-6">
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{activas.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Activas</div>
        </div>
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{vendidas.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Vendidas</div>
        </div>
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">${ganancias.toLocaleString()}</div>
          <div className="text-[11px] text-gray-400 mt-1">Ganancias</div>
        </div>
      </div>

      {/* Publicaciones */}
      <div className="space-y-2.5">
        {mine.map((l) => {
          const f = sellerFees(l.price);
          return (
            <div key={l.id} className="flex gap-3.5 bg-card-purple border border-white/10 rounded-2xl p-3.5 items-center">
              <div className="w-14 h-14 rounded-xl gradient-pink-purple flex items-center justify-center text-2xl shrink-0">{l.emoji}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate flex items-center gap-2">
                  {l.eventName}
                  {l.verified && <BadgeCheck className="w-4 h-4 text-green-400 shrink-0" />}
                </h4>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
                  <span>{l.date}</span>
                  <span>{l.zone}</span>
                  <span>{l.quantity} boleto(s)</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ${l.price.toLocaleString()} c/u · recibes <span className="text-green-400 font-bold">${f.payout.toLocaleString()}</span> c/u
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[l.status]}`}>
                  {l.status}
                </span>
                <div className="flex gap-1.5">
                  {l.status === "activa" && (
                    <button
                      onClick={() => { listings.setStatus(l.id, "pausada"); toast.success("Publicación pausada"); }}
                      title="Pausar"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {l.status === "pausada" && (
                    <button
                      onClick={() => { listings.setStatus(l.id, "activa"); toast.success("Publicación reactivada"); }}
                      title="Reactivar"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {l.status !== "vendida" && (
                    <button
                      onClick={() => { listings.remove(l.id); toast.success("Publicación eliminada"); }}
                      title="Eliminar"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-pink/30 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
