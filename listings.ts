// ============================================================================
// LISTINGS — Modelo unificado de boletos en venta
// ----------------------------------------------------------------------------
// DECISIÓN DE ARQUITECTURA: los 4 sistemas de FastTicket (venta oficial,
// reventa de usuarios, boleteras externas y organizadores) comparten este
// único modelo `Listing`, diferenciado por el campo `source`. Así el buscador,
// las tarjetas y el checkout funcionan igual para las 4 fuentes.
//
// Patrón idéntico a cart.ts: storage key + evento de ventana + hook React.
// ============================================================================
import { useEffect, useState } from "react";

// ---------- TIPOS ----------
export type ListingSource = "oficial" | "reventa" | "organizador" | "externa";
export type ListingStatus = "activa" | "pausada" | "vendida";

export type Listing = {
  id: string;
  source: ListingSource;
  status: ListingStatus;
  eventSlug: string;
  eventName: string;
  emoji: string;
  date: string;      // fecha visible, ej. "14 Jun 2026"
  isoDate: string;   // fecha ISO para ordenar
  venue: string;
  city: string;
  zone: string;
  price: number;     // precio por boleto fijado por el vendedor (MXN)
  quantity: number;  // boletos disponibles en esta publicación
  sellerEmail: string;
  sellerName: string;
  verified: boolean; // pasó la verificación anti-fraude (mock)
  createdAt: string; // ISO
};

// ---------- COMISIÓN DEL VENDEDOR (transparente) ----------
// FastTicket cobra 10% al vendedor. Viagogo cobra hasta 25% y lo oculta.
export const SELLER_COMMISSION = 0.1;

/** Desglose transparente para el vendedor: comisión y cuánto recibe. */
export function sellerFees(price: number) {
  const commission = Math.round(price * SELLER_COMMISSION);
  return { commission, payout: price - commission };
}

// ---------- PERSISTENCIA (mismo patrón que cart.ts) ----------
const KEY = "ft_listings";
const EVT = "ft_listings_change";

// Publicaciones semilla: simulan reventas ya existentes de usuarios del mockDb.
const seedListings: Listing[] = [
  {
    id: "L-SEED-1",
    source: "reventa",
    status: "activa",
    eventSlug: "bad-bunny-foro-sol",
    eventName: "Bad Bunny — DeBÍ TiRAR MáS FOToS Tour",
    emoji: "🐰",
    date: "14 Jun 2026",
    isoDate: "2026-06-14",
    venue: "Foro Sol",
    city: "CDMX",
    zone: "General B",
    price: 1650,
    quantity: 2,
    sellerEmail: "ana@example.com",
    sellerName: "Ana García",
    verified: true,
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "L-SEED-2",
    source: "reventa",
    status: "activa",
    eventSlug: "caifanes-reunion",
    eventName: "Caifanes — Reunión",
    emoji: "🎸",
    date: "08 Jun 2026",
    isoDate: "2026-06-08",
    venue: "Auditorio Nacional",
    city: "CDMX",
    zone: "Luneta Preferente",
    price: 2100,
    quantity: 4,
    sellerEmail: "carlos@example.com",
    sellerName: "Carlos Ruiz",
    verified: true,
    createdAt: "2026-05-22T15:30:00Z",
  },
  {
    id: "L-SEED-3",
    source: "reventa",
    status: "activa",
    eventSlug: "metallica-m72",
    eventName: "Metallica — M72 World Tour",
    emoji: "🤘",
    date: "5 Jul 2026",
    isoDate: "2026-07-05",
    venue: "Estadio GNP",
    city: "CDMX",
    zone: "NA 105",
    price: 1900,
    quantity: 1,
    sellerEmail: "ana@example.com",
    sellerName: "Ana García",
    verified: false,
    createdAt: "2026-06-01T09:00:00Z",
  },
];

function read(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Listing[];
    // Primera visita: sembramos publicaciones de ejemplo.
    localStorage.setItem(KEY, JSON.stringify(seedListings));
    return seedListings;
  } catch {
    return seedListings;
  }
}

function write(items: Listing[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

// ---------- HOOK ----------
/** Hook central del marketplace de reventa. */
export function useListings() {
  const [items, setItems] = useState<Listing[]>([]);

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

    /** Publicaciones activas y con inventario (lo que ve el marketplace). */
    active: items.filter((l) => l.status === "activa" && l.quantity > 0),

    /** Publicaciones de un vendedor específico (para "Mis ventas"). */
    mine: (email: string) => items.filter((l) => l.sellerEmail === email),

    /** Crea una publicación nueva; devuelve el id generado. */
    add: (listing: Omit<Listing, "id" | "createdAt" | "status">) => {
      const id = "L-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      const nuevo: Listing = {
        ...listing,
        id,
        status: "activa",
        createdAt: new Date().toISOString(),
      };
      write([nuevo, ...read()]);
      return id;
    },

    /** Cambia el estado (activa ↔ pausada, o vendida). */
    setStatus: (id: string, status: ListingStatus) => {
      write(read().map((l) => (l.id === id ? { ...l, status } : l)));
    },

    /** Descuenta boletos tras una compra; marca vendida si llega a 0. */
    markSold: (id: string, qty: number) => {
      write(
        read().map((l) => {
          if (l.id !== id) return l;
          const remaining = Math.max(0, l.quantity - qty);
          return { ...l, quantity: remaining, status: remaining === 0 ? "vendida" : l.status };
        }),
      );
    },

    /** Elimina la publicación definitivamente. */
    remove: (id: string) => write(read().filter((l) => l.id !== id)),
  };
}
