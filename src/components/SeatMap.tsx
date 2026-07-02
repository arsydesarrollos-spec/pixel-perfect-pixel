import { useRef, useState } from "react";
import type { SeatZone, Venue } from "@/lib/venues";

type Props = {
  venue: Venue;
  selectedZone: string;
  onSelect: (id: string) => void;
};

function bandColor(band: SeatZone["band"], isSelected: boolean, available: boolean) {
  if (!available) return "#333";
  if (isSelected) return "#ffffff";
  if (band === "floor") return "#E91E8C";
  if (band === "A") return "#c2185b";
  if (band === "B") return "#7b3fa0";
  return "#4a3f6b"; // band C
}

function polygonStyle(zone: SeatZone, isSelected: boolean): React.CSSProperties {
  const xs = zone.points.map((p) => p[0]);
  const ys = zone.points.map((p) => p[1]);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const right = Math.max(...xs);
  const bottom = Math.max(...ys);
  const w = Math.max(right - left, 2);
  const h = Math.max(bottom - top, 2);
  const clip = zone.points
    .map(([x, y]) => `${(((x - left) / w) * 100).toFixed(1)}% ${(((y - top) / h) * 100).toFixed(1)}%`)
    .join(",");
  const lift = isSelected && zone.available ? zone.z + 16 : zone.z;

  return {
    position: "absolute",
    left,
    top,
    width: w,
    height: h,
    clipPath: `polygon(${clip})`,
    background: bandColor(zone.band, isSelected, zone.available),
    boxShadow: isSelected && zone.available ? "0 0 0 2px #fff, 0 24px 30px -12px rgba(0,0,0,.55)" : "0 24px 30px -12px rgba(0,0,0,.55)",
    transform: `translateZ(${lift}px)`,
    transition: "transform .15s, filter .15s, background .1s",
    cursor: zone.available ? "pointer" : "not-allowed",
  };
}

const VIEWS: Record<string, { x: number; y: number }> = {
  aerea: { x: 56, y: 0 },
  frontal: { x: 70, y: 0 },
  lateral: { x: 56, y: 30 },
};

export function SeatMap({ venue, selectedZone, onSelect }: Props) {
  const [rotX, setRotX] = useState(56);
  const [rotY, setRotY] = useState(0);
  const [zoom, setZoom] = useState(0.82);
  const [activeView, setActiveView] = useState<string | null>("aerea");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; zone: SeatZone } | null>(null);

  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const start = useRef({ x: 0, y: 0, rotX: 56, rotY: 0 });

  const arenaTransform = `scale(${zoom}) rotateX(${rotX}deg) rotateZ(${rotY}deg)`;

  const setView = (name: string) => {
    const v = VIEWS[name];
    setRotX(v.x);
    setRotY(v.y);
    setActiveView(name);
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    dragging.current = true;
    dragMoved.current = false;
    start.current = { x: clientX, y: clientY, rotX, rotY };
  };
  const onPointerMove = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const dx = clientX - start.current.x;
    const dy = clientY - start.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved.current = true;
    setRotY(Math.max(-70, Math.min(70, start.current.rotY + dx * 0.3)));
    setRotX(Math.max(30, Math.min(80, start.current.rotX - dy * 0.25)));
    setActiveView(null);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const handleZoneClick = (zone: SeatZone) => {
    if (dragMoved.current) return; // suppress click that was actually a drag
    if (!zone.available) {
      onSelect(zone.id);
      return;
    }
    onSelect(zone.id);
  };

  return (
    <div className="bg-card-purple border border-white/10 rounded-2xl p-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(["aerea", "frontal", "lateral"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3.5 py-2 text-xs rounded-full border transition ${
              activeView === v ? "bg-pink text-white border-pink" : "border-white/15 text-gray-400 hover:text-white hover:border-white/40"
            }`}
          >
            {v === "aerea" ? "Vista aérea" : v === "frontal" ? "Desde el escenario" : "Vista lateral"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-gray-500 hidden sm:flex items-center gap-1">🖱️ Arrastra para rotar</span>
        <div className="flex gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.08))}
            className="w-7 h-7 rounded-lg border border-white/15 text-white hover:border-pink hover:text-pink text-sm"
          >
            −
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(1.2, z + 0.08))}
            className="w-7 h-7 rounded-lg border border-white/15 text-white hover:border-pink hover:text-pink text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div
        className="relative rounded-xl overflow-hidden select-none"
        style={{
          height: 480,
          background: "radial-gradient(ellipse at 50% 25%, #241a30 0%, #0d0a13 70%, #050408 100%)",
          perspective: 1500,
          perspectiveOrigin: "50% 18%",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
        onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onPointerUp}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            width: venue.arenaSize.width,
            height: venue.arenaSize.height,
            marginLeft: -venue.arenaSize.width / 2,
            marginTop: -venue.arenaSize.height / 2,
            transformStyle: "preserve-3d",
            transform: arenaTransform,
            transition: dragging.current ? "none" : "transform .25s ease-out",
          }}
        >
          {/* Floor grid for depth reference */}
          <div
            style={{
              position: "absolute",
              left: -200,
              top: -150,
              width: venue.arenaSize.width + 400,
              height: venue.arenaSize.height + 300,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              transform: "translateZ(-2px)",
            }}
          />

          {/* Stage */}
          <div
            style={{
              position: "absolute",
              left: venue.stage.left,
              top: venue.stage.top,
              width: venue.stage.width,
              height: venue.stage.height,
              borderRadius: 6,
              background: "linear-gradient(180deg,#3a3a3a,#242424)",
              transform: "translateZ(30px)",
              boxShadow: "0 40px 60px -20px rgba(0,0,0,.7)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: venue.stage.left,
              top: venue.stage.top,
              width: venue.stage.width,
              height: venue.stage.height - 5,
              background: "linear-gradient(180deg,#E91E8C 0%, #4a1030 100%)",
              transform: "translateZ(30px) rotateX(90deg)",
              transformOrigin: "top",
              borderRadius: "4px 4px 0 0",
              boxShadow: "0 0 40px rgba(233,30,140,.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: venue.stage.left,
              top: venue.stage.top + 24,
              width: venue.stage.width,
              textAlign: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              transform: "translateZ(31px)",
            }}
          >
            ESCENARIO
          </div>

          {/* Zones */}
          {venue.zones.map((zone) => {
            const isSelected = zone.id === selectedZone;
            return (
              <div
                key={zone.id}
                style={polygonStyle(zone, isSelected)}
                onClick={() => handleZoneClick(zone)}
                onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, zone })}
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    textAlign: "center",
                    color: "#fff",
                    fontSize: zone.band === "floor" ? 14 : 9,
                    fontWeight: 800,
                    pointerEvents: "none",
                    textShadow: "0 1px 4px rgba(0,0,0,.7)",
                    lineHeight: 1.2,
                  }}
                >
                  {zone.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/10">
        <LegendItem color="#E91E8C" label="General A / General B (piso)" />
        <LegendItem color="#c2185b" label="Anillo A" />
        <LegendItem color="#7b3fa0" label="Anillo B (NA / VE)" />
        <LegendItem color="#4a3f6b" label="Anillo C (NA / VE)" />
        <LegendItem color="#fff" outline label="Seleccionado" />
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-black border border-pink rounded-lg px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <b className="block text-white text-[13px] mb-0.5">{tooltip.zone.name}</b>
          <span className="text-pink font-bold">{tooltip.zone.available ? `$${tooltip.zone.price.toLocaleString()}` : "Agotado"}</span>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <div
        className="w-4 h-4 rounded"
        style={{ background: color, border: outline ? "1.5px solid #E91E8C" : "none" }}
      />
      {label}
    </div>
  );
}
