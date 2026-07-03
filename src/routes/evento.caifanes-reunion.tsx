import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, ShieldCheck, Ticket, Plus, Minus, ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { FORO_SOL } from "@/lib/venues";
import { SeatMap } from "@/components/SeatMap";

export const Route = createFileRoute("/evento/caifanes-reunion")({
  head: () => ({
    meta: [
      { title: "Caifanes — Reunión | Fastickett.com" },
      { name: "description", content: "Boletos para Caifanes Reunión en Foro Sol (Estadio GNP Seguros), CDMX. Compra segura con Fastickett.com." },
    ],
  }),
  component: ProductPage,
});

const event = {
  slug: "caifanes-reunion",
  name: "Caifanes — Reunión",
  emoji: "🎸",
  date: "11 Jul 2026",
  time: "21:00 hrs",
  venue: FORO_SOL.name,
  city: FORO_SOL.city,
  description:
    "La banda mexicana de rock alternativo regresa con una noche única e irrepetible. Saúl Hernández, Sabo Romo, Diego Herrera y Alfonso André interpretarán los clásicos que marcaron a varias generaciones: 'Afuera', 'La Negra Tomasa', 'Aquí no es así', 'No dejes que…' y muchos más.",
};

function ProductPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const [selectedZone, setSelectedZone] = useState(FORO_SOL.zones[0].id);
  const [qty, setQty] = useState(2);

  const zone = FORO_SOL.zones.find((z) => z.id === selectedZone)!;

  const addToCart = () => {
    if (!zone.available) {
      toast.error("Esta zona está agotada, elige otra en el mapa");
      return;
    }
    cart.add({
      eventSlug: event.slug,
      eventName: event.name,
      zone: zone.name,
      price: zone.price,
      quantity: qty,
      date: event.date,
      venue: `${event.venue}, ${event.city}`,
      emoji: event.emoji,
    });
    toast.success(`${qty} boleto(s) agregados al carrito`);
  };

  const buyNow = () => {
    if (!zone.available) {
      toast.error("Esta zona está agotada, elige otra en el mapa");
      return;
    }
    addToCart();
    setTimeout(() => navigate({ to: "/carrito" }), 200);
  };

  return (
    <div className="min-h-screen bg-app text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-app/95 backdrop-blur z-10">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <Link to="/" className="text-xl font-black">
          Fastickett<span className="text-pink">.com</span>
        </Link>
        <Link to="/carrito" className="text-sm flex items-center gap-2 hover:text-pink transition">
          <Ticket className="w-4 h-4" /> Carrito ({cart.count})
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Event head */}
        <span className="inline-block bg-pink/20 border border-pink/40 text-pink text-xs font-bold px-3 py-1 rounded-full mb-3">
          CONCIERTO · FECHA ÚNICA
        </span>
        <h1 className="text-4xl font-black mb-3">{event.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-pink" /> {event.date}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-pink" /> {event.time}</span>
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pink" /> {event.venue}, {event.city}</span>
        </div>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-3xl">{event.description}</p>

        {/* Map + purchase panel */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <SeatMap venue={FORO_SOL} selectedZone={selectedZone} onSelect={setSelectedZone} />

          <div className="bg-card-purple border border-white/10 rounded-2xl p-5 h-fit lg:sticky lg:top-24">
            <h3 className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Zona seleccionada</h3>
            <p className="text-lg font-black mb-1">{zone.name}</p>
            <p className="text-xs text-gray-400 mb-4">{zone.desc}</p>

            {!zone.available ? (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 mb-4">
                Esta zona está agotada. Elige otra zona en el mapa.
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-pink mb-4">
                  ${zone.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">c/u</span>
                </div>

                <div className="flex items-center justify-between mb-4 p-3.5 bg-black/40 border border-white/10 rounded-xl">
                  <span className="text-sm text-gray-400">Cantidad</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg border border-white/15 hover:border-pink hover:text-pink flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-5 text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(10, qty + 1))} className="w-8 h-8 rounded-lg border border-white/15 hover:border-pink hover:text-pink flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-black text-lg">${(zone.price * qty).toLocaleString()} <span className="text-[10px] text-gray-500">MXN</span></span>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <button onClick={buyNow} className="w-full bg-pink hover:opacity-90 transition py-3.5 rounded-xl font-bold text-white">
                Comprar ahora
              </button>
              <button onClick={addToCart} className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-xl font-medium text-sm">
                Agregar al carrito
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-pink" />
              Compra 100% segura · Garantía Fastickett
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
