// ============================================================================
// /vender — Asistente de venta de boletos (Sistema 2: Reventa)
// ----------------------------------------------------------------------------
// Flujo de 4 pasos: 1) Evento y zona → 2) Boletos y verificación →
// 3) Precio con calculadora transparente → 4) Revisión y publicación.
// Requiere sesión (mismo patrón de protección que /cuenta).
// ============================================================================
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Ticket, ShieldCheck, BadgeCheck, Calendar, MapPin,
  Building2, AlertCircle, TrendingDown,
} from "lucide-react";
import { useAuth, requestLogin } from "@/lib/auth";
import { useListings, sellerFees, SELLER_COMMISSION } from "@/lib/listings";
import { fees } from "@/lib/cart";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vende tus boletos | Fastickett.com" },
      { name: "description", content: "Publica tus boletos en minutos con comisión transparente del 10%. Sin cargos ocultos." },
    ],
  }),
  component: VenderPage,
});

// ---------- CATÁLOGO DE EVENTOS VENDIBLES ----------
// El vendedor elige de eventos conocidos por la plataforma (evita fraude de
// eventos inventados). Más adelante esto vendrá del backend.
const SELLABLE_EVENTS = [
  { slug: "bad-bunny-foro-sol", name: "Bad Bunny — DeBÍ TiRAR MáS FOToS Tour", emoji: "🐰", date: "14 Jun 2026", isoDate: "2026-06-14", venue: "Foro Sol", city: "CDMX" },
  { slug: "metallica-m72", name: "Metallica — M72 World Tour", emoji: "🤘", date: "5 Jul 2026", isoDate: "2026-07-05", venue: "Estadio GNP", city: "CDMX" },
  { slug: "caifanes-reunion", name: "Caifanes — Reunión", emoji: "🎸", date: "08 Jun 2026", isoDate: "2026-06-08", venue: "Auditorio Nacional", city: "CDMX" },
  { slug: "chivas-america", name: "Chivas vs América — Clásico Nacional", emoji: "⚽", date: "25 May 2026", isoDate: "2026-05-25", venue: "Estadio Akron", city: "Guadalajara" },
  { slug: "nodal-pal-cora", name: "Christian Nodal — Pa'l Cora Tour", emoji: "🎤", date: "28 Jun 2026", isoDate: "2026-06-28", venue: "Arena Monterrey", city: "Monterrey" },
];

const inputCss =
  "w-full bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none";

const STEPS = ["Evento", "Boletos", "Precio", "Publicar"];

function VenderPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const listings = useListings();

  // --- Protección de ruta (mismo patrón que cuenta.tsx) ---
  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/" });
      requestLogin();
      toast.error("Inicia sesión para vender tus boletos");
    }
  }, [ready, user, navigate]);

  // --- Estado del asistente ---
  const [step, setStep] = useState(1);
  const [eventSlug, setEventSlug] = useState(SELLABLE_EVENTS[0].slug);
  const [zone, setZone] = useState("");
  const [quantity, setQuantity] = useState(2);
  const [ticketCode, setTicketCode] = useState("");
  const [price, setPrice] = useState("");

  const event = SELLABLE_EVENTS.find((e) => e.slug === eventSlug)!;
  const priceNum = Number(price) || 0;
  const seller = sellerFees(priceNum);
  const buyer = fees(priceNum); // lo que verá el comprador (12% servicio + 16% IVA)

  // Verificación mock: un código real de boleto tiene al menos 6 caracteres.
  const verified = ticketCode.trim().length >= 6;

  // Validaciones por paso
  const canNext = useMemo(() => {
    if (step === 1) return zone.trim().length >= 2;
    if (step === 2) return quantity >= 1 && ticketCode.trim().length >= 4;
    if (step === 3) return priceNum >= 50;
    return true;
  }, [step, zone, quantity, ticketCode, priceNum]);

  const publish = () => {
    listings.add({
      source: "reventa",
      eventSlug: event.slug,
      eventName: event.name,
      emoji: event.emoji,
      date: event.date,
      isoDate: event.isoDate,
      venue: event.venue,
      city: event.city,
      zone: zone.trim(),
      price: priceNum,
      quantity,
      sellerEmail: user!.email,
      sellerName: user!.name,
      verified,
    });
    toast.success("¡Publicación creada! Tus boletos ya están a la venta 🎉");
    navigate({ to: "/cuenta/ventas" });
  };

  if (!ready || !user) return null;

  return (
    <div className="min-h-screen bg-app text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-app/95 backdrop-blur z-10">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <Link to="/" className="text-xl font-black">
          Fastickett<span className="text-pink">.com</span>
        </Link>
        <Link to="/reventa" className="text-sm flex items-center gap-2 hover:text-pink transition">
          <Ticket className="w-4 h-4" /> Ver reventa
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Vende tus boletos</h1>
        <p className="text-sm text-gray-400 mb-8">
          Comisión fija del {Math.round(SELLER_COMMISSION * 100)}% — transparente desde el inicio, sin sorpresas.
        </p>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-pink text-white" : "bg-white/10 text-gray-400"}`}>{n}</div>
                  <span className={`text-[10px] ${step >= n ? "text-white" : "text-gray-500"}`}>{label}</span>
                </div>
                {n < STEPS.length && <div className={`flex-1 h-1 rounded mb-4 ${step > n ? "bg-pink" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        {/* ── PASO 1: Evento y zona ── */}
        {step === 1 && (
          <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">¿De qué evento son tus boletos?</h2>
            <div className="space-y-2">
              {SELLABLE_EVENTS.map((e) => (
                <button
                  key={e.slug}
                  onClick={() => setEventSlug(e.slug)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 ${eventSlug === e.slug ? "border-pink bg-pink/10" : "border-white/10 bg-app hover:border-pink/50"}`}
                >
                  <span className="text-2xl">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{e.name}</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {e.date}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {e.venue}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.city}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Zona / Sección de tus boletos</label>
              <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Ej. General B, Luneta, NA 105..." className={inputCss} />
            </div>
          </section>
        )}

        {/* ── PASO 2: Boletos y verificación ── */}
        {step === 2 && (
          <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold">Detalles de tus boletos</h2>
            <div>
              <label className="text-sm font-medium block mb-2">¿Cuántos boletos vendes?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setQuantity(n)} className={`w-11 h-11 rounded-lg border font-bold text-sm transition ${quantity === n ? "border-pink bg-pink/10 text-pink" : "border-white/10 bg-app hover:border-pink/50"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Código del boleto (verificación anti-fraude)</label>
              <input value={ticketCode} onChange={(e) => setTicketCode(e.target.value.toUpperCase())} placeholder="Código impreso en tu boleto, ej. FT-8XK2P9" className={inputCss} />
              <div className={`mt-2 flex items-center gap-2 text-xs ${verified ? "text-green-400" : "text-gray-400"}`}>
                {verified ? <BadgeCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {verified
                  ? "Boleto verificado — tu publicación mostrará el sello de verificación"
                  : "Ingresa el código para obtener el sello de boleto verificado (opcional pero recomendado)"}
              </div>
            </div>
            <div className="bg-pink/10 border border-pink/30 rounded-xl p-4 flex gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-pink shrink-0 mt-0.5" />
              <p className="text-gray-300">Los boletos verificados se venden hasta 3 veces más rápido. Fastickett valida el código contra el emisor original antes de aprobar la publicación.</p>
            </div>
          </section>
        )}

        {/* ── PASO 3: Precio con calculadora transparente ── */}
        {step === 3 && (
          <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold">Fija tu precio por boleto</h2>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 text-sm">$</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="0"
                inputMode="numeric"
                className={`${inputCss} pl-8 text-lg font-bold`}
              />
              <span className="absolute right-4 top-3.5 text-xs text-gray-500">MXN</span>
            </div>

            {/* Calculadora en vivo: el corazón de la transparencia */}
            <div className="bg-app border border-white/10 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Precio por boleto</span><span>${priceNum.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Comisión Fastickett ({Math.round(SELLER_COMMISSION * 100)}%)</span><span className="text-gray-300">−${seller.commission.toLocaleString()}</span></div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between font-black text-base">
                <span>Tú recibes por boleto</span>
                <span className="text-green-400">${seller.payout.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">Total por {quantity} boleto(s)</span>
                <span className="text-green-400">${(seller.payout * quantity).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-app border border-white/10 rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
              <p className="font-bold text-white text-sm mb-2">Lo que verá el comprador (sin sorpresas):</p>
              <div className="flex justify-between"><span>Boleto</span><span>${priceNum.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Cargo por servicio + IVA</span><span>${(buyer.service + buyer.tax).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-white"><span>Total comprador</span><span>${buyer.total.toLocaleString()}</span></div>
            </div>

            <div className="flex gap-3 bg-pink/10 border border-pink/30 rounded-xl p-4 text-xs">
              <TrendingDown className="w-5 h-5 text-pink shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong className="text-white">Ventaja Fastickett:</strong> otras plataformas cobran hasta 25% de comisión y la revelan hasta el final. Aquí tú y tu comprador ven todos los cargos desde el primer momento.
              </p>
            </div>
          </section>
        )}

        {/* ── PASO 4: Revisión y publicación ── */}
        {step === 4 && (
          <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">Revisa tu publicación</h2>
            <div className="flex gap-4 items-center bg-app border border-white/10 rounded-xl p-4">
              <div className="w-16 h-16 rounded-xl gradient-pink-purple flex items-center justify-center text-3xl shrink-0">{event.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate flex items-center gap-2">
                  {event.name}
                  {verified && <BadgeCheck className="w-4 h-4 text-green-400 shrink-0" />}
                </div>
                <div className="text-xs text-gray-400 mt-1">{event.date} · {event.venue}, {event.city}</div>
                <div className="text-xs text-gray-400">{zone} · {quantity} boleto(s)</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-black text-pink text-lg">${priceNum.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500">por boleto</div>
              </div>
            </div>
            <div className="text-sm text-gray-300 bg-app border border-white/10 rounded-xl p-4">
              Recibirás <strong className="text-green-400">${(seller.payout * quantity).toLocaleString()} MXN</strong> cuando
              se vendan todos tus boletos. El pago se libera 48 h después del evento (protección al comprador).
            </div>
          </section>
        )}

        {/* Navegación entre pasos */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-5 py-3 rounded-xl border border-white/15 text-white disabled:opacity-30 text-sm font-medium"
          >
            Atrás
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="px-6 py-3 rounded-xl bg-pink text-white font-bold disabled:opacity-40 hover:opacity-90 transition"
            >
              Siguiente
            </button>
          ) : (
            <button onClick={publish} className="px-6 py-3 rounded-xl bg-pink text-white font-bold hover:opacity-90 transition flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Publicar boletos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
