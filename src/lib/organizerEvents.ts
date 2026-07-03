// ============================================================================
// ORGANIZER EVENTS — Eventos creados por organizadores (Sistema 4)
// ----------------------------------------------------------------------------
// Un organizador crea un evento con sus zonas (nombre, precio, inventario).
// El evento publicado se vende en su página dinámica /e/{slug}.
// Comisión al organizador: 5% por boleto vendido (transparente).
//
// Patrón idéntico a cart.ts / listings.ts: storage key + evento + hook React.
// ============================================================================
import { useEffect, useState } from "react";

// ---------- TIPOS ----------
export type OrgZone = {
  name: string;
  price: number;    // precio por boleto (MXN)
  quantity: number; // inventario total
  sold: number;     // boletos vendidos
};

export type OrgEventStatus = "publicado" | "pausado";

export type OrganizerEvent = {
  id: string;
  slug: string;          // usado en la URL pública /e/{slug}
  name: string;
  emoji: string;
  date: string;          // fecha visible, ej. "15 Ago 2026"
  isoDate: string;       // ISO para ordenar
  time: string;          // ej. "20:00 hrs"
  venue: string;
  city: string;
  description: string;
  category: string;      // Concierto / Deporte / Cultura / Festival
  zones: OrgZone[];
  organizerEmail: string;
  organizerName: string;
  status: OrgEventStatus;
  createdAt: string;
};

// ---------- COMISIÓN DEL ORGANIZADOR (transparente) ----------
export const ORGANIZER_COMMISSION = 0.05;

/** Desglose por boleto: comisión Fastickett y cuánto recibe el organizador. */
export function organizerFees(price: number) {
  const commission = Math.round(price * ORGANIZER_COMMISSION);
  return { commission, payout: price - commission };
}

/** Convierte un nombre de evento en slug de URL: "Mi Evento 2026" → "mi-evento-2026". */
export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---------- PERSISTENCIA ----------
const KEY = "ft_org_events";
const EVT = "ft_org_events_change";

// Evento semilla: demo de un organizador (Ana) ya publicado.
const seedEvents: OrganizerEvent[] = [
  {
    id: "OE-SEED-1",
    slug: "noche-de-salsa-hermosillo",
    name: "Noche de Salsa Hermosillo",
    emoji: "💃",
    date: "15 Ago 2026",
    isoDate: "2026-08-15",
    time: "20:00 hrs",
    venue: "Expo Fórum",
    city: "Hermosillo",
    description:
      "Una noche completa de salsa en vivo con orquesta de 12 músicos, pista de baile profesional y clase gratuita para principiantes al inicio del evento.",
    category: "Concierto",
    zones: [
      { name: "Pista VIP", price: 850, quantity: 100, sold: 34 },
      { name: "General", price: 450, quantity: 300, sold: 121 },
      { name: "Mesa (4 personas)", price: 2800, quantity: 25, sold: 9 },
    ],
    organizerEmail: "ana@example.com",
    organizerName: "Ana García",
    status: "publicado",
    createdAt: "2026-06-10T12:00:00Z",
  },
];

function read(): OrganizerEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as OrganizerEvent[];
    localStorage.setItem(KEY, JSON.stringify(seedEvents));
    return seedEvents;
  } catch {
    return seedEvents;
  }
}

function write(items: OrganizerEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

// ---------- HOOK ----------
export function useOrganizerEvents() {
  const [items, setItems] = useState<OrganizerEvent[]>([]);

  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return {
    items,

    /** Eventos publicados (visibles al público). */
    published: items.filter((e) => e.status === "publicado"),

    /** Eventos de un organizador (para su panel). */
    mine: (email: string) => items.filter((e) => e.organizerEmail === email),

    /** Busca un evento por su slug de URL. */
    bySlug: (slug: string) => items.find((e) => e.slug === slug) ?? null,

    /** Crea y publica un evento nuevo; devuelve el slug generado. */
    add: (ev: Omit<OrganizerEvent, "id" | "slug" | "createdAt" | "status">) => {
      const all = read();
      // Slug único: si ya existe, agrega sufijo numérico.
      let slug = slugify(ev.name) || "evento";
      let n = 2;
      while (all.some((e) => e.slug === slug)) slug = `${slugify(ev.name)}-${n++}`;
      const nuevo: OrganizerEvent = {
        ...ev,
        id: "OE-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        slug,
        status: "publicado",
        createdAt: new Date().toISOString(),
      };
      write([nuevo, ...all]);
      return slug;
    },

    /** Publica o pausa un evento. */
    setStatus: (id: string, status: OrgEventStatus) => {
      write(read().map((e) => (e.id === id ? { ...e, status } : e)));
    },

    /** Registra una venta: incrementa `sold` de la zona indicada. */
    sellZone: (eventId: string, zoneName: string, qty: number) => {
      write(
        read().map((e) => {
          if (e.id !== eventId) return e;
          return {
            ...e,
            zones: e.zones.map((z) =>
              z.name === zoneName ? { ...z, sold: Math.min(z.quantity, z.sold + qty) } : z,
            ),
          };
        }),
      );
    },

    /** Elimina el evento definitivamente. */
    remove: (id: string) => write(read().filter((e) => e.id !== id)),
  };
}
