import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, ShieldCheck, Ticket, Plus, Minus, ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/evento/caifanes-reunion")({
  head: () => ({
    meta: [
      { title: "Caifanes — Reunión | FastTicket.com" },
      { name: "description", content: "Boletos para Caifanes Reunión en el Auditorio Nacional, CDMX. Compra segura con FastTicket.com." },
    ],
  }),
  component: ProductPage,
});

const event = {
  slug: "caifanes-reunion",
  name: "Caifanes — Reunión",
  emoji: "\n",
  date: "08 Jun 2026",
  time: "21:00 hrs",
  venue: "Auditorio Nacional",
  city: "CDMX",
  description:
    "La banda mexicana de rock alternativo regresa con una noche única e irrepetible. Saúl Hernández, Sabo Romo, Diego Herrera y Alfonso André interpretarán los clásicos que marcaron a varias generaciones: 'Afuera', 'La Negra Tomasa', 'Aquí no es así', 'No dejes que…' y muchos más.",
};

const zones = [
  { id: "vip", name: "VIP — Pista Frontal", price: 3500, available: true, desc: "Acceso preferencial, primeras filas" },
  { id: "luneta", name: "Luneta Preferente", price: 2400, available: true, desc: "Asientos centrales planta baja" },
  { id: "balcon1", name: "1er Balcón", price: 1450, available: true, desc: "Vista panorámica privilegiada" },
  { id: "balcon2", name: "2do Balcón", price: 950, available: true, desc: "Excelente acústica" },
  { id: "galeria", name: "Galería", price: 580, available: false, desc: "Agotado" },
];

function ProductPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const [selectedZone, setSelectedZone] = useState(zones[1].id);
  const [qty, setQty] = useState(2);

  const zone = zones.find((z) => z.id === selectedZone)!;

  const addToCart = () => {
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
          FastTicket<span className="text-pink">.com</span>
        </Link>
        <Link to="/carrito" className="text-sm flex items-center gap-2 hover:text-pink transition">
          <Ticket className="w-4 h-4" /> Carrito ({cart.count})
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-8">
        {/* Image / Hero */}
        <div>
          <div className="aspect-[4/5] rounded-2xl gradient-pink-purple flex items-center justify-center text-9xl shadow-2xl">
            {event.emoji}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {["\n", "\n", "🥁", "\n"].map((e, i) => (
              <div key={i} className="aspect-square rounded-lg bg-card-purple flex items-center justify-center text-3xl border border-white/10">
                {e}
              </div>
            ))}
          </div>
        </div>

        {/* Info & purchase */}
        <div>
          <span className="inline-block bg-pink/20 border border-pink/40 text-pink text-xs font-bold px-3 py-1 rounded-full mb-3">
            CONCIERTO · FECHA ÚNICA
          </span>
          <h1 className="text-4xl font-black mb-3">{event.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-gray-300 mb-4">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-pink" /> {event.date}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-pink" /> {event.time}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pink" /> {event.venue}, {event.city}</span>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{event.description}</p>

          <h3 className="font-bold mb-3">Selecciona tu zona</h3>
          <div className="space-y-2 mb-6">
            {zones.map((z) => (
              <button
                key={z.id}
                disabled={!z.available}
                onClick={() => setSelectedZone(z.id)}
                className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                  !z.available
                    ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                    : selectedZone === z.id
                    ? "border-pink bg-pink/10"
                    : "border-white/10 bg-card-purple hover:border-pink/50"
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{z.name}</div>
                  <div className="text-xs text-gray-400">{z.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-pink">${z.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">MXN</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6 p-4 bg-card-purple rounded-xl border border-white/10">
            <span className="text-sm font-medium">Cantidad</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-6 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(8, qty + 1))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 text-lg">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-black text-2xl">${(zone.price * qty).toLocaleString()} <span className="text-xs text-gray-500">MXN</span></span>
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
