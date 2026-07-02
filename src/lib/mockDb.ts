// ---------- MOCK DATABASE ----------
// Simulated backend data. Replace with real API calls once a backend exists.

export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext only in mock DB — never exposed to the client
  phone: string;
  isAdmin?: boolean;
  photo?: string; // data URL for uploaded avatar
  address?: string;
  location?: string;
  credits?: number;
};

export type MockTicket = {
  code: string; // ticket QR code (mock)
};

export type MockOrder = {
  id: string;
  userEmail: string;
  eventName: string;
  emoji: string;
  date: string; // display date, e.g. "08 Jun 2026"
  isoDate: string; // ISO date for sorting/upcoming-vs-past logic
  venue: string;
  zone: string;
  quantity: number;
  unitPrice: number;
  service: number;
  tax: number;
  total: number;
  status: "Completado" | "Pendiente";
  tickets: MockTicket[];
};

export type MockFavorite = {
  id: string;
  userEmail: string;
  eventId: string;
  artist: string;
  emoji: string;
  date: string;
  venue: string;
  price: number;
};

export type MockBillingAddress = {
  id: string;
  userEmail: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};

function makeTicketCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "Ana García",
    email: "ana@example.com",
    password: "demo123",
    phone: "6622345678",
    address: "Av. Reforma 123, Col. Centro",
    location: "CDMX, México",
    credits: 250,
  },
  {
    id: "u2",
    name: "Carlos Ruiz",
    email: "carlos@example.com",
    password: "demo123",
    phone: "6623456789",
  },
  {
    id: "u3",
    name: "Admin",
    email: "admin@fastticket.com",
    password: "admin123",
    phone: "6622348169",
    isAdmin: true,
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "FT-A1B2C3D4",
    userEmail: "ana@example.com",
    eventName: "Caifanes — Reunión",
    emoji: "🎸",
    date: "08 Jun 2026",
    isoDate: "2026-06-08",
    venue: "Auditorio Nacional, CDMX",
    zone: "Luneta Preferente",
    quantity: 2,
    unitPrice: 2400,
    service: 576,
    tax: 768,
    total: 5544,
    status: "Completado",
    tickets: [{ code: makeTicketCode() }, { code: makeTicketCode() }],
  },
  {
    id: "FT-E5F6G7H8",
    userEmail: "ana@example.com",
    eventName: "Bad Bunny — DeBÍ TiRAR MáS FOToS Tour",
    emoji: "🎤",
    date: "14 Jun 2026",
    isoDate: "2026-06-14",
    venue: "Foro Sol, CDMX",
    zone: "General",
    quantity: 1,
    unitPrice: 1850,
    service: 222,
    tax: 296,
    total: 2368,
    status: "Completado",
    tickets: [{ code: makeTicketCode() }],
  },
  {
    id: "FT-I9J0K1L2",
    userEmail: "ana@example.com",
    eventName: "Festival Vive Latino",
    emoji: "🎉",
    date: "21 Mar 2026",
    isoDate: "2026-03-21",
    venue: "Foro Sol, CDMX",
    zone: "Día completo",
    quantity: 2,
    unitPrice: 1200,
    service: 288,
    tax: 384,
    total: 2688,
    status: "Completado",
    tickets: [{ code: makeTicketCode() }, { code: makeTicketCode() }],
  },
  {
    id: "FT-M3N4O5P6",
    userEmail: "ana@example.com",
    eventName: "Chivas vs América",
    emoji: "⚽",
    date: "25 Nov 2025",
    isoDate: "2025-11-25",
    venue: "Estadio Akron, Guadalajara",
    zone: "Preferente",
    quantity: 3,
    unitPrice: 580,
    service: 209,
    tax: 278,
    total: 2227,
    status: "Completado",
    tickets: [{ code: makeTicketCode() }, { code: makeTicketCode() }, { code: makeTicketCode() }],
  },
  {
    id: "FT-Q7R8S9T0",
    userEmail: "ana@example.com",
    eventName: "Café Tacvba",
    emoji: "🎶",
    date: "19 Jul 2025",
    isoDate: "2025-07-19",
    venue: "Pepsi Center, CDMX",
    zone: "General",
    quantity: 1,
    unitPrice: 780,
    service: 94,
    tax: 125,
    total: 999,
    status: "Completado",
    tickets: [{ code: makeTicketCode() }],
  },
];

export const mockFavorites: MockFavorite[] = [
  {
    id: "fav1",
    userEmail: "ana@example.com",
    eventId: "2",
    artist: "Metallica",
    emoji: "🤘",
    date: "5 Jul 2026",
    venue: "Estadio GNP, CDMX",
    price: 2100,
  },
  {
    id: "fav2",
    userEmail: "ana@example.com",
    eventId: "6",
    artist: "Tame Impala",
    emoji: "🎧",
    date: "3 Ago 2026",
    venue: "Pepsi Center, CDMX",
    price: 1350,
  },
];

export const mockBillingAddresses: MockBillingAddress[] = [
  {
    id: "ba1",
    userEmail: "ana@example.com",
    address: "Av. Reforma 123, Col. Centro",
    city: "CDMX",
    country: "México",
    zip: "06000",
  },
];
