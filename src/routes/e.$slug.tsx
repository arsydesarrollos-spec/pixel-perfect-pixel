// ============================================================================
// /e/$slug — Página pública dinámica de evento (Sistemas 1 y 4)
// ----------------------------------------------------------------------------
// Primera ruta dinámica de FastTicket: renderiza CUALQUIER evento creado por
// un organizador a partir de su slug en la URL. Selección de zona, cantidad,
// compra hacia el carrito existente y descuento de inventario en vivo.
// ============================================================================
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Ticket, Calendar, Clock, MapPin, ShieldCheck, Plus, Minus,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useOrganizerEvents } from "@/lib/organizerEvents";

export const Route = createFileRoute("/e/$slug")({
  head: () => ({ meta: [{ title: "Evento | FastTicket.com" }] }),
  component: DynamicEventPage,
});

function DynamicEventPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const events = useOrganizerEvents();
  const navigate = useNavigate();

  const event = events.bySlug(slug);

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [qty, setQty] = useState(2);

  // ── Evento inexistente o pausado ──
  if (events.items.length > 0 && (!event || event.status !== "publicado")) {
    return (
      <div className="min-h-screen bg-app text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h1 className="text-2xl font-black mb-2">Evento no disponible</h1>
          <p className="text-gray-400 text-sm mb-6">Este evento no existe o su venta está pausada por el organizador.</p>
          <Link to="/" className="bg-pink px-6 py-3 rounded-xl font-bold hover:opacity-90">Explorar eventos</Link>
        </div>
      </div>
    );
  }
  if (!event) return null; // hidratando localStorage

  // Zona seleccionada (por defecto la primera con disponibilidad)
  const availableZones = event.zones.filter((z) => z.quantity - z.sold > 0);
  const zone =
    event.zones.find((z) => z.name === selectedZone) ?? availableZones[0] ?? null;
  const zoneAvailable = zone ? zone.quantity - zone.sold : 0;
  const effQty = Math.min(qty, Math.max(1, zoneAvailable));

  const addToCart = () => {
    if (!zone || zoneAvailable === 0) {
      toast.error("Esta zona está agotada");
      return;
    }
    cart.add({
      eventSlug: event.slug,
      eventName: event.name,
      zone: zone.name,
      price: zone.price,
      quantity: effQty,
      date: event.date,
      venue: `${event.venue}, ${event.city}`,
      emoji: event.emoji,
    });
    events.sellZone(event.id, zone.name, effQty); // descuenta inventario
    toast.success(`${effQty} boleto(s) agregados al carrito`);
  };

  const buyNow = () => {
    addToCart();
    setTimeout(() => navigate({ to: "/carrito" }), 200);
  };

  return (
    <div className="min-h-screen bg-app text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-app/95 backdrop-blur z-10">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <Link to="/" className="text-xl font-black">
          FastTicket<span className="text-pink">.com</span>
        </Link>
        <Link to="/carrito" className="text-sm flex items-center gap-2 hover:text-pink transition">
          <Ticket className="w-4 h-4" /> Carrito ({cart.count})
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-8">
        {/* Hero visual */}
        <div>
          <div className="aspect-[4/5] rounded-2xl gradient-pink-purple flex items-center justify-center text-9xl shadow-2xl">
            {event.emoji}
          </div>
        </div>

        {/* Información y compra */}
        <div>
          <span className="inline-block bg-pink/20 border border-pink/40 text-pink text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase">
            {event.category} · Organizado por {event.organizerName.split(" ")[0]}
          </span>
          <h1 className="text-4xl font-black mb-3">{event.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-gray-300 mb-4">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-pink" /> {event.date}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-pink" /> {event.time}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pink" /> {event.venue}, {event.city}</span>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{event.description}</p>

          {/* Selector de zona con disponibilidad en vivo */}
          <h3 className="font-bold mb-3">Selecciona tu zona</h3>
          <div className="space-y-2 mb-6">
            {event.zones.map((z) => {
              const avail = z.quantity - z.sold;
              const isSel = zone?.name === z.name;
              return (
                <button
                  key={z.name}
                  disabled={avail === 0}
                  onClick={() => setSelectedZone(z.name)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                    avail === 0
                      ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                      : isSel
                      ? "border-pink bg-pink/10"
                      : "border-white/10 bg-card-purple hover:border-pink/50"
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{z.name}</div>
                    <div className="text-xs text-gray-400">
                      {avail === 0 ? "Agotado" : avail <= 10 ? `¡Solo quedan ${avail}!` : `${avail} disponibles`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-pink">${z.price.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">MXN</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cantidad */}
          <div className="flex items-center justify-between mb-6 p-4 bg-card-purple rounded-xl border border-white/10">
            <span className="text-sm font-medium">Cantidad</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-6 text-center">{effQty}</span>
              <button onClick={() => setQty(Math.min(8, Math.min(zoneAvailable || 8, qty + 1)))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtotal + CTA */}
          <div className="flex items-center justify-between mb-4 text-lg">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-black text-2xl">
              ${((zone?.price ?? 0) * effQty).toLocaleString()} <span className="text-xs text-gray-500">MXN</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={buyNow} className="w-full bg-pink hover:opacity-90 transition py-4 rounded-xl font-bold text-white">
              Comprar ahora
            </button>
            <button onClick={addToCart} className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-xl font-medium text-sm">
              Agregar al carrito
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-pink" />
            Compra 100% segura · Garantía FastTicket
          </div>
        </div>
      </div>
    </div>
  );
}
