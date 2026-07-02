import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MockOrder } from "@/lib/mockDb";

type Props = {
  order: MockOrder;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

// Renders a QR-like grid deterministically from a seed string so the same code
// always produces the same pattern without needing an external QR library.
function QRGrid({ seed }: { seed: string }) {
  const size = 21;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  const isFinder = (r: number, c: number) => {
    const inCorner = (rr: number, cc: number) => rr <= 6 && cc <= 6;
    return (
      inCorner(r, c) ||
      inCorner(r, size - 1 - c) ||
      inCorner(size - 1 - r, c)
    );
  };
  return (
    <div
      className="grid bg-white p-2 rounded"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        width: 180,
        height: 180,
      }}
    >
      {cells.map((on, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        const finder = isFinder(r, c);
        // Draw finder markers as solid nested squares for authenticity.
        let filled = on;
        if (finder) {
          const localR =
            r <= 6 ? r : size - 1 - r;
          const localC = c <= 6 ? c : size - 1 - c;
          const inRing =
            localR === 0 || localR === 6 || localC === 0 || localC === 6;
          const inCore = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          filled = inRing || inCore;
        }
        return (
          <div
            key={i}
            style={{ background: filled ? "#000" : "#fff" }}
          />
        );
      })}
    </div>
  );
}

export function TicketModal({ order, index, onIndexChange, onClose }: Props) {
  const ticket = order.tickets[index];
  const total = order.tickets.length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < total - 1) onIndexChange(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [index, total, onClose, onIndexChange]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-card-purple rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* FTE-style ticket header */}
        <div className="gradient-pink-purple px-5 pt-5 pb-4 text-center">
          <div className="text-[10px] font-black tracking-[0.3em] text-white/80">
            FASTTICKET · E-TICKET
          </div>
          <div className="text-3xl mt-1">{order.emoji}</div>
          <div className="font-black text-base mt-1 leading-tight">{order.eventName}</div>
          <div className="text-xs text-white/85 mt-1">{order.date}</div>
        </div>

        {/* Perforation */}
        <div className="relative h-4 bg-card-purple">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-app" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-app" />
          <div
            className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t border-dashed border-white/20"
          />
        </div>

        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div>
              <div className="text-gray-500 uppercase text-[10px] tracking-wider">Recinto</div>
              <div className="font-semibold mt-0.5">{order.venue}</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-[10px] tracking-wider">Zona</div>
              <div className="font-semibold mt-0.5">{order.zone}</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-[10px] tracking-wider">Boleto</div>
              <div className="font-semibold mt-0.5">
                #{index + 1} de {total}
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-[10px] tracking-wider">Orden</div>
              <div className="font-semibold mt-0.5">{order.id}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
            <QRGrid seed={ticket.code} />
            <div className="text-[10px] tracking-widest text-gray-400 font-mono">
              {ticket.code}
            </div>
          </div>

          {total > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                disabled={index === 0}
                onClick={() => onIndexChange(index - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-white/15 disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3" /> Anterior
              </button>
              <div className="flex gap-1">
                {order.tickets.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === index ? "bg-pink" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>
              <button
                disabled={index === total - 1}
                onClick={() => onIndexChange(index + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-white/15 disabled:opacity-30"
              >
                Siguiente <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
