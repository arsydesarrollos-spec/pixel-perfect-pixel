// ============================================================================
// /organizador — Panel de organizadores (Sistema 4)
// ----------------------------------------------------------------------------
// Dos vistas en una página: (a) lista de mis eventos con ventas e ingresos,
// (b) asistente de creación en 3 pasos: Datos → Zonas y precios → Publicar.
// Cada evento publicado obtiene su página pública en /e/{slug}.
// ============================================================================
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Plus, Trash2, Pause, Play, ExternalLink, Calendar,
  MapPin, Building2, Ticket, TrendingUp, BadgeCheck,
} from "lucide-react";
import { useAuth, requestLogin } from "@/lib/auth";
import {
  useOrganizerEvents, organizerFees, ORGANIZER_COMMISSION, type OrgZone,
} from "@/lib/organizerEvents";

export const Route = createFileRoute("/organizador")({
  head: () => ({
    meta: [
      { title: "Panel de Organizador | Fastickett.com" },
      { name: "description", content: "Crea tu evento y véndelo en Fastickett con comisión transparente del 5%." },
    ],
  }),
  component: OrganizadorPage,
});

const inputCss =
  "w-full bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none";

const EMOJIS = ["🎤", "🎸", "🎹", "💃", "🎪", "⚽", "🏀", "🎭", "🎨", "🍷", "😂", "🎬"];
const CATEGORIES = ["Concierto", "Deporte", "Cultura", "Festival", "Teatro", "Conferencia"];
const STEPS = ["Datos", "Zonas", "Publicar"];

// Zona editable en el asistente (precio/cantidad como texto mientras se escribe)
type DraftZone = { name: string; price: string; quantity: string };
const emptyZone = (): DraftZone => ({ name: "", price: "", quantity: "" });

function OrganizadorPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const events = useOrganizerEvents();

  // Protección de ruta (mismo patrón que /cuenta y /vender)
  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/" });
      requestLogin();
      toast.error("Inicia sesión para acceder al panel de organizador");
    }
  }, [ready, user, navigate]);

  const [creating, setCreating] = useState(false);

  if (!ready || !user) return null;

  const mine = events.mine(user.email);

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
        <div className="w-16" />
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {creating ? (
          <CreateEventWizard
            organizerEmail={user.email}
            organizerName={user.name}
            onDone={() => setCreating(false)}
          />
        ) : (
          <MyEventsList mine={mine} onCreate={() => setCreating(true)} />
        )}
      </div>
    </div>
  );
}

// ══════════ VISTA A: Lista de mis eventos ══════════
function MyEventsList({ mine, onCreate }: {
  mine: ReturnType<typeof useOrganizerEvents>["items"];
  onCreate: () => void;
}) {
  const events = useOrganizerEvents();

  // Métricas globales del organizador
  const totals = useMemo(() => {
    let sold = 0, revenue = 0;
    mine.forEach((e) =>
      e.zones.forEach((z) => {
        sold += z.sold;
        revenue += organizerFees(z.price).payout * z.sold;
      }),
    );
    return { sold, revenue };
  }, [mine]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-3xl font-black">Panel de Organizador</h1>
          <p className="text-sm text-gray-400 mt-1">
            Comisión fija del {Math.round(ORGANIZER_COMMISSION * 100)}% por boleto — sin cargos ocultos.
          </p>
        </div>
        <button onClick={onCreate} className="px-5 py-3 rounded-xl bg-pink text-white font-bold hover:opacity-90 transition text-sm flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Crear evento
        </button>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-3 gap-3 my-6">
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black">{mine.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Eventos</div>
        </div>
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black">{totals.sold}</div>
          <div className="text-[11px] text-gray-400 mt-1">Boletos vendidos</div>
        </div>
        <div className="bg-card-purple border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">${totals.revenue.toLocaleString()}</div>
          <div className="text-[11px] text-gray-400 mt-1">Ingresos netos</div>
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="text-center py-16 bg-card-purple rounded-2xl border border-white/10">
          <div className="text-5xl mb-4">🎪</div>
          <p className="text-gray-400 mb-4 text-sm">Aún no has creado ningún evento.</p>
          <button onClick={onCreate} className="text-pink text-sm font-bold hover:underline">Crear mi primer evento</button>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((e) => {
            const sold = e.zones.reduce((s, z) => s + z.sold, 0);
            const total = e.zones.reduce((s, z) => s + z.quantity, 0);
            const revenue = e.zones.reduce((s, z) => s + organizerFees(z.price).payout * z.sold, 0);
            const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
            return (
              <article key={e.id} className="bg-card-purple border border-white/10 rounded-2xl p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-pink-purple flex items-center justify-center text-3xl shrink-0">{e.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm flex items-center gap-2 flex-wrap">
                      {e.name}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${e.status === "publicado" ? "text-green-400 bg-green-400/10 border-green-400/30" : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"}`}>
                        {e.status}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {e.date}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {e.venue}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.city}</span>
                    </div>
                    {/* Barra de progreso de ventas */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> {sold} / {total} vendidos ({pct}%)</span>
                        <span className="flex items-center gap-1 text-green-400 font-bold"><TrendingUp className="w-3 h-3" /> ${revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-pink rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Acciones */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                  <Link
                    to="/e/$slug"
                    params={{ slug: e.slug }}
                    className="px-3 py-2 rounded-lg bg-pink text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Ver página pública
                  </Link>
                  {e.status === "publicado" ? (
                    <button onClick={() => { events.setStatus(e.id, "pausado"); toast.success("Evento pausado — ya no acepta compras"); }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5">
                      <Pause className="w-3.5 h-3.5" /> Pausar
                    </button>
                  ) : (
                    <button onClick={() => { events.setStatus(e.id, "publicado"); toast.success("Evento publicado de nuevo"); }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Publicar
                    </button>
                  )}
                  <button onClick={() => { events.remove(e.id); toast.success("Evento eliminado"); }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-pink/30 text-xs font-medium flex items-center gap-1.5 ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════ VISTA B: Asistente de creación (3 pasos) ══════════
function CreateEventWizard({ organizerEmail, organizerName, onDone }: {
  organizerEmail: string;
  organizerName: string;
  onDone: () => void;
}) {
  const events = useOrganizerEvents();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "", emoji: EMOJIS[0], category: CATEGORIES[0],
    date: "", time: "", venue: "", city: "", description: "",
  });
  const [zones, setZones] = useState<DraftZone[]>([emptyZone()]);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));
  const setZone = (i: number, k: keyof DraftZone, v: string) =>
    setZones((p) => p.map((z, idx) => (idx === i ? { ...z, [k]: v } : z)));

  // Zonas válidas convertidas a números (para revisión y publicación)
  const parsedZones: OrgZone[] = useMemo(
    () =>
      zones
        .filter((z) => z.name.trim() && Number(z.price) > 0 && Number(z.quantity) > 0)
        .map((z) => ({ name: z.name.trim(), price: Number(z.price), quantity: Number(z.quantity), sold: 0 })),
    [zones],
  );

  const potential = parsedZones.reduce((s, z) => s + organizerFees(z.price).payout * z.quantity, 0);

  const canNext =
    step === 1
      ? data.name.trim().length >= 3 && data.date.trim() && data.venue.trim() && data.city.trim()
      : step === 2
      ? parsedZones.length >= 1
      : true;

  const publish = () => {
    // Fecha ISO derivada del input tipo date (YYYY-MM-DD)
    const iso = data.date;
    const [y, m, d] = iso.split("-");
    const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const visible = m && d ? `${Number(d)} ${MESES[Number(m) - 1]} ${y}` : iso;

    const slug = events.add({
      name: data.name.trim(),
      emoji: data.emoji,
      category: data.category,
      date: visible,
      isoDate: iso,
      time: data.time.trim() || "Por confirmar",
      venue: data.venue.trim(),
      city: data.city.trim(),
      description: data.description.trim() || "Próximamente más detalles.",
      zones: parsedZones,
      organizerEmail,
      organizerName,
    });
    toast.success("¡Evento publicado! Ya está a la venta 🎉");
    navigate({ to: "/e/$slug", params: { slug } });
  };

  return (
    <div>
      <button onClick={onDone} className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink transition mb-4">
        <ChevronLeft className="w-4 h-4" /> Mis eventos
      </button>
      <h1 className="text-2xl font-black mb-6">Crear evento</h1>

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

      {/* ── PASO 1: Datos generales ── */}
      {step === 1 && (
        <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-4">
          <input placeholder="Nombre del evento" value={data.name} onChange={(e) => set("name", e.target.value)} className={inputCss} />
          <div>
            <label className="text-xs text-gray-400 block mb-2">Ícono del evento</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button key={em} onClick={() => set("emoji", em)} className={`w-11 h-11 rounded-lg border text-xl transition ${data.emoji === em ? "border-pink bg-pink/10" : "border-white/10 bg-app hover:border-pink/50"}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <select value={data.category} onChange={(e) => set("category", e.target.value)} className={inputCss}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Fecha</label>
              <input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} className={inputCss} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Hora</label>
              <input placeholder="Ej. 20:00 hrs" value={data.time} onChange={(e) => set("time", e.target.value)} className={inputCss} />
            </div>
          </div>
          <input placeholder="Venue (recinto)" value={data.venue} onChange={(e) => set("venue", e.target.value)} className={inputCss} />
          <input placeholder="Ciudad" value={data.city} onChange={(e) => set("city", e.target.value)} className={inputCss} />
          <textarea placeholder="Descripción del evento" value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCss} />
        </section>
      )}

      {/* ── PASO 2: Zonas y precios ── */}
      {step === 2 && (
        <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Zonas del evento</h2>
            <button onClick={() => setZones((p) => [...p, emptyZone()])} className="text-pink text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Agregar zona
            </button>
          </div>
          {zones.map((z, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_90px_36px] gap-2 items-center">
              <input placeholder="Nombre de zona (Ej. VIP)" value={z.name} onChange={(e) => setZone(i, "name", e.target.value)} className={inputCss} />
              <input placeholder="Precio" inputMode="numeric" value={z.price} onChange={(e) => setZone(i, "price", e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputCss} />
              <input placeholder="Cant." inputMode="numeric" value={z.quantity} onChange={(e) => setZone(i, "quantity", e.target.value.replace(/\D/g, "").slice(0, 5))} className={inputCss} />
              <button
                onClick={() => setZones((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-pink/30 flex items-center justify-center"
                title="Quitar zona"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-gray-500">Precio en MXN por boleto. La comisión Fastickett del {Math.round(ORGANIZER_COMMISSION * 100)}% se descuenta de tus ingresos, no se suma al comprador de tu parte.</p>
        </section>
      )}

      {/* ── PASO 3: Revisión y publicación ── */}
      {step === 3 && (
        <section className="bg-card-purple border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex gap-4 items-center bg-app border border-white/10 rounded-xl p-4">
            <div className="w-16 h-16 rounded-xl gradient-pink-purple flex items-center justify-center text-3xl shrink-0">{data.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{data.name}</div>
              <div className="text-xs text-gray-400 mt-1">{data.date} · {data.venue}, {data.city}</div>
              <div className="text-xs text-gray-400">{data.category} · {parsedZones.length} zona(s)</div>
            </div>
          </div>

          {/* Desglose por zona con comisión transparente */}
          <div className="bg-app border border-white/10 rounded-xl p-4 space-y-2 text-sm">
            {parsedZones.map((z) => {
              const f = organizerFees(z.price);
              return (
                <div key={z.name} className="flex justify-between text-xs">
                  <span className="text-gray-400">{z.name} · {z.quantity} × ${z.price.toLocaleString()}</span>
                  <span>recibes <strong className="text-green-400">${f.payout.toLocaleString()}</strong> c/u</span>
                </div>
              );
            })}
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between font-black">
              <span>Ingreso potencial (todo vendido)</span>
              <span className="text-green-400">${potential.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 bg-pink/10 border border-pink/30 rounded-xl p-4 text-xs">
            <BadgeCheck className="w-5 h-5 text-pink shrink-0 mt-0.5" />
            <p className="text-gray-300">Al publicar, tu evento tendrá su propia página pública con URL compartible y aparecerá listo para vender. Los pagos se liquidan 48 h después del evento.</p>
          </div>
        </section>
      )}

      {/* Navegación entre pasos */}
      <div className="flex justify-between gap-3 mt-6">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-5 py-3 rounded-xl border border-white/15 text-white disabled:opacity-30 text-sm font-medium">
          Atrás
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext} className="px-6 py-3 rounded-xl bg-pink text-white font-bold disabled:opacity-40 hover:opacity-90 transition">
            Siguiente
          </button>
        ) : (
          <button onClick={publish} className="px-6 py-3 rounded-xl bg-pink text-white font-bold hover:opacity-90 transition flex items-center gap-2">
            <Ticket className="w-4 h-4" /> Publicar evento
          </button>
        )}
      </div>
    </div>
  );
}
