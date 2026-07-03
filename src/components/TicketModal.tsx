// ============================================================================
// TicketModal — Boleto digital visual (rediseño estilo pase de abordar)
// ----------------------------------------------------------------------------
// Reemplazo drop-in: mismas props y export que la versión anterior, por lo que
// BoletosList y cualquier otro consumidor funcionan sin cambios.
//
// ÍNDICE DE SECCIONES:
//   1. Imports y tipos
//   2. QRGrid — QR determinístico con acentos rosas
//   3. Perforación — separador troquelado reutilizable
//   4. TicketModal — el boleto completo con slides entre boletos
// ============================================================================

/* ── SECCIÓN 1: Imports y tipos ── */
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MockOrder } from "@/lib/mockDb";
import { useAuth } from "@/lib/auth";

type Props = {
  order: MockOrder;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

// Hora del evento: MockOrder aún no guarda hora; si en el futuro se agrega
// `time` al modelo, el boleto la usará automáticamente.
const eventTime = (order: MockOrder) =>
  (order as MockOrder & { time?: string }).time ?? "20:30";

/* ── SECCIÓN 2: QRGrid — patrón determinístico con acentos rosas ── */
// Genera siempre el mismo patrón para el mismo código, sin librerías externas.
// Los 3 cuadros localizadores llevan núcleo rosa y ~1 de cada 6 módulos es rosa,
// replicando el estilo visual de la marca.
function QRGrid({ seed }: { seed: string }) {
  const size = 21;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const cells: { on: boolean; pink: boolean }[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push({ on: (h & 1) === 1, pink: h % 6 === 0 });
  }

  const finderAt = (r: number, c: number) =>
    (r <= 6 && c <= 6) || (r <= 6 && c >= size - 7) || (r >= size - 7 && c <= 6);

  return (
    <div
      className="grid bg-white rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        width: 190,
        height: 190,
        padding: 10,
        border: "3px solid #000",
        boxShadow: "0 0 0 3px #E91E8C, 0 12px 32px rgba(233,30,140,.25)",
      }}
    >
      {cells.map((cell, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        let bg = "#fff";
        if (finderAt(r, c)) {
          // Localizadores: anillo negro + núcleo rosa (como el diseño de marca)
          const lr = r <= 6 ? r : r - (size - 7);
          const lc = c <= 6 ? c : c - (size - 7);
          const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          bg = ring ? "#000" : core ? "#E91E8C" : "#fff";
        } else if (cell.on) {
          bg = cell.pink ? "#E91E8C" : "#000";
        }
        return <div key={i} style={{ background: bg }} />;
      })}
    </div>
  );
}

/* ── SECCIÓN 3: Perforación — separador troquelado ── */
function Perforation() {
  return (
    <div className="relative h-6">
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70" style={{ background: "rgba(0,0,0,.85)" }} />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: "rgba(0,0,0,.85)" }} />
      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/20" />
    </div>
  );
}

/* ── SECCIÓN 4: TicketModal — el boleto completo ── */
export function TicketModal({ order, index, onIndexChange, onClose }: Props) {
  const { user } = useAuth();
  const ticket = order.tickets[index];
  const total = order.tickets.length;

  // Dirección del slide (para animar de izquierda/derecha) + soporte táctil
  const prevIndex = useRef(index);
  const [dir, setDir] = useState<"left" | "right">("right");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setDir(index >= prevIndex.current ? "right" : "left");
    prevIndex.current = index;
  }, [index]);

  // Navegación con teclado: ← → cambian de boleto, Esc cierra
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < total - 1) onIndexChange(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [index, total, onClose, onIndexChange]);

  // Swipe táctil (deslizar en móvil para cambiar de boleto)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (delta < -40 && index < total - 1) onIndexChange(index + 1);
    if (delta > 40 && index > 0) onIndexChange(index - 1);
  };

  const holderName = user?.name ?? "Titular";
  const initials = holderName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const seat = index + 1;
  const zoneUpper = order.zone.toUpperCase();
  const venueShort = order.venue;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ══ Encabezado con degradado rosa ══ */}
        <div
          className="relative px-6 pt-5 pb-5 overflow-hidden"
          style={{ background: "linear-gradient(120deg, #E91E8C 0%, #C2185B 55%, #8E0E56 100%)" }}
        >
          {/* Círculo decorativo translúcido */}
          <div className="absolute -top-10 -right-6 w-36 h-36 rounded-full bg-white/15" />

          <div className="flex items-start justify-between relative">
            <div className="text-sm font-black text-white">
              FastTicket<span className="text-white/70">.com</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center transition -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <span className="absolute top-12 right-5 text-[10px] font-black tracking-wider bg-black/45 text-white px-3 py-1.5 rounded-full">
            ZONA {zoneUpper}
          </span>

          <h2 className="text-2xl font-black text-white mt-3 leading-tight pr-24">
            {order.eventName}
          </h2>
          <p className="text-sm text-white/90 mt-1 flex items-center gap-1.5">
            <span className="text-white">•</span> {venueShort}
          </p>
        </div>

        {/* ══ Cuerpo del boleto (se desliza al cambiar de boleto) ══ */}
        <div
          key={index}
          className={`animate-in fade-in duration-300 ${
            dir === "right" ? "slide-in-from-right-8" : "slide-in-from-left-8"
          }`}
        >
          {/* Fecha / Hora / Asiento */}
          <div className="grid grid-cols-3 gap-2 px-6 pt-5 pb-2">
            <div>
              <div className="text-[10px] tracking-widest text-gray-500 font-semibold">FECHA</div>
              <div className="font-black text-[15px] mt-0.5">{order.date}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-gray-500 font-semibold">HORA</div>
              <div className="font-black text-[15px] mt-0.5">{eventTime(order)}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-gray-500 font-semibold">ASIENTO</div>
              <div className="font-black text-[15px] mt-0.5">{seat}</div>
            </div>
          </div>

          <Perforation />

          {/* QR + código + estado */}
          <div className="px-6 pt-2 pb-4 flex flex-col items-center">
            <div className="text-[11px] font-black tracking-[0.25em] text-pink mb-4">
              ESCANEA PARA INGRESAR
            </div>
            <QRGrid seed={ticket.code} />
            <div className="mt-3 font-mono text-sm font-bold tracking-[0.2em] text-white">
              #{ticket.code}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-black tracking-wider text-green-400 bg-green-400/10 border border-green-400/30 px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> BOLETO VÁLIDO
            </div>
          </div>

          {/* Titular de la entrada */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 bg-white/[.06] border border-white/10 rounded-2xl px-4 py-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#E91E8C,#8E0E56)" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{holderName}</div>
                <div className="text-xs text-pink">Titular de la entrada</div>
              </div>
              <span className="text-[9px] font-black tracking-wider bg-pink/15 border border-pink/40 text-pink px-2.5 py-1.5 rounded-full whitespace-nowrap">
                {zoneUpper} · Asiento {seat}
              </span>
            </div>
          </div>

          <Perforation />

          {/* Instrucciones */}
          <div className="px-6 pt-2 pb-4">
            <div className="text-[10px] tracking-widest text-gray-500 font-semibold mb-1.5">
              INSTRUCCIONES
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Puertas abren 1 hora antes del show. No se permite acceso con cámaras
              profesionales.
              <br />
              Contacto: 01 800 AYUDA
            </p>
          </div>
        </div>

        {/* ══ Paginador: cambiar entre boletos de la orden ══ */}
        <div className="flex items-center justify-center gap-5 pb-5 pt-1">
          <button
            disabled={index === 0}
            onClick={() => onIndexChange(index - 1)}
            aria-label="Boleto anterior"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black">
            {index + 1} de {total}
          </span>
          <button
            disabled={index === total - 1}
            onClick={() => onIndexChange(index + 1)}
            aria-label="Boleto siguiente"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
