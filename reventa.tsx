// ============================================================================
// /reventa — Marketplace de boletos de reventa (Sistema 2)
// ----------------------------------------------------------------------------
// Lista las publicaciones activas de usuarios. Diferenciador vs Viagogo:
// el PRECIO TOTAL (con cargos) se muestra desde la tarjeta, no en el checkout.
// Comprar agrega al carrito existente y descuenta inventario del listing.
// ============================================================================
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Ticket, BadgeCheck, Calendar, Building2, MapPin,
  ShieldCheck, ArrowUpDown, Tag,
} from "lucide-react";
import { useCart, fees } from "@/lib/cart";
import { useListings, type Listing } from "@/lib/listings";

export const Route = createFileRoute("/reventa")({
  head: () => ({
    meta: [
      { title: "Reventa verificada | FastTicket.com" },
      { name: "description", content: "Boletos de otros fans con verificación anti-fraude y precio total transparente desde el inicio." },
    ],
  }),
  component: ReventaPage,
});

type SortMode = "precio-asc" | "precio-desc" | "fecha";

function ReventaPage() {
  const cart = useCart();
  const listings = useListings();
  const navigate = useNavigate();

  const [eventFilter, setEventFilter] = useState("todos");
  const [sort, setSort] = useState<SortMode>("precio-asc");
  const [buyQty, setBuyQty] = useState<Record<string, number>>({}); // qty elegida por listing

  // Eventos únicos presentes en las publicaciones activas (para el filtro)
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    listings.active.forEach((l) => map.set(l.eventSlug, l.eventName));
    return Array.from(map.entries());
  }, [listings.active]);

  const visible = useMemo(() => {
    let arr = listings.active;
    if (eventFilter !== "todos") arr = arr.filter((l) => l.eventSlug === eventFilter);
    const sorted = [...arr];
    if (sort === "precio-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "precio-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "fecha") sorted.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    return sorted;
  }, [listings.active, eventFilter, sort]);

  const buy = (l: Listing) => {
    const qty = Math.min(buyQty[l.id] ?? 1, l.quantity);
    cart.add({
      eventSlug: l.eventSlug,
      eventName: l.eventName,
      zone: `${l.zone} · Reventa de ${l.sellerName.split(" ")[0]}`,
      price: l.price,
      quantity: qty,
      date: l.date,
      venue: `${l.venue}, ${l.city}`,
      emoji: l.emoji,
    });
    listings.markSold(l.id, qty);
    toast.success(`${qty} boleto(s) agregados al carrito`);
    setTimeout(() => navigate({ to: "/carrito" }), 250);
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Encabezado + propuesta de valor */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black">Reventa verificada</h1>
            <p className="text-sm text-gray-400 mt-1">Boletos de otros fans, con precio total visible desde el inicio.</p>
          </div>
          <Link to="/vender" className="px-5 py-3 rounded-xl bg-pink text-white font-bold hover:opacity-90 transition text-sm">
            Vender mis boletos
          </Link>
        </div>

        <div className="flex gap-3 bg-pink/10 border border-pink/30 rounded-xl p-4 text-xs mb-8 mt-4">
          <ShieldCheck className="w-5 h-5 text-pink shrink-0 mt-0.5" />
          <p className="text-gray-300">
            <strong className="text-white">Garantía FastTicket:</strong> si un boleto de reventa resulta inválido,
            te reembolsamos el 100% o te conseguimos uno equivalente. El pago al vendedor se libera 48 h después del evento.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-card-purple border border-white/10 rounded-lg px-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="bg-transparent py-2.5 text-sm outline-none">
              <option value="todos">Todos los eventos</option>
              {eventOptions.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-card-purple border border-white/10 rounded-lg px-3">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="bg-transparent py-2.5 text-sm outline-none">
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="fecha">Fecha del evento</option>
            </select>
          </div>
        </div>

        {/* Listado */}
        {visible.length === 0 ? (
          <div className="text-center py-20 bg-card-purple rounded-2xl border border-white/10">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-gray-400 mb-6">No hay boletos de reventa disponibles por ahora.</p>
            <Link to="/vender" className="bg-pink px-6 py-3 rounded-xl font-bold hover:opacity-90">Sé el primero en vender</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((l) => {
              const qty = Math.min(buyQty[l.id] ?? 1, l.quantity);
              const totalBuyer = fees(l.price * qty).total;
              return (
                <article key={l.id} className="bg-card-purple border border-white/10 hover:border-pink/40 transition rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-pink-purple flex items-center justify-center text-3xl shrink-0">{l.emoji}</div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm flex items-center gap-2 flex-wrap">
                      {l.eventName}
                      {l.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Verificado
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {l.date}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {l.venue}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.city}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1.5">
                      {l.zone} · Vende: {l.sellerName.split(" ")[0]} · {l.quantity} disponible(s)
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-pink text-lg leading-none">${l.price.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">por boleto</div>
                      {/* Transparencia: total real con cargos, visible desde la tarjeta */}
                      <div className="text-[11px] text-gray-300 mt-1">
                        Total c/cargos: <strong className="text-white">${totalBuyer.toLocaleString()}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={qty}
                        onChange={(e) => setBuyQty((p) => ({ ...p, [l.id]: Number(e.target.value) }))}
                        className="bg-app border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-pink"
                        aria-label="Cantidad"
                      >
                        {Array.from({ length: l.quantity }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button onClick={() => buy(l)} className="px-4 py-2 rounded-lg bg-pink text-white font-bold text-sm hover:opacity-90 transition">
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
