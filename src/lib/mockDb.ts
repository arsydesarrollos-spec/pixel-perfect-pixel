export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  isAdmin?: boolean;
};

export type MockOrder = {
  id: string;
  email: string;
  eventName: string;
  date: string;
  venue: string;
  zone: string;
  qty: number;
  total: number;
  tickets: { code: string }[];
};

const genCode = () =>
  "FT-" +
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const makeTickets = (n: number) => Array.from({ length: n }, () => ({ code: genCode() }));

export const mockUsers: MockUser[] = [
  { id: "u_1", name: "Ana García", email: "ana@example.com", password: "demo123", phone: "6622345678" },
  { id: "u_2", name: "Carlos Ruiz", email: "carlos@example.com", password: "demo123", phone: "6623456789" },
  { id: "u_3", name: "Admin", email: "admin@fastticket.com", password: "admin123", isAdmin: true },
];

export const mockOrders: MockOrder[] = [
  { id: "o_1", email: "ana@example.com", eventName: "Caifanes - Reunión", date: "15 Mar 2025", venue: "Palacio de los Deportes", zone: "VIP", qty: 2, total: 4800, tickets: makeTickets(2) },
  { id: "o_2", email: "ana@example.com", eventName: "Bad Bunny - World Tour", date: "22 Abr 2025", venue: "Foro Sol", zone: "General", qty: 1, total: 1500, tickets: makeTickets(1) },
  { id: "o_3", email: "ana@example.com", eventName: "Coldplay - Music of the Spheres", date: "10 Jun 2025", venue: "Estadio GNP", zone: "Luneta", qty: 4, total: 12800, tickets: makeTickets(4) },
  { id: "o_4", email: "ana@example.com", eventName: "Chivas vs América", date: "05 Ago 2025", venue: "Estadio Akron", zone: "Palco", qty: 2, total: 3600, tickets: makeTickets(2) },
  { id: "o_5", email: "ana@example.com", eventName: "Vive Latino 2025", date: "18 Sep 2025", venue: "Foro Sol", zone: "General", qty: 3, total: 6900, tickets: makeTickets(3) },
];

export const mockFavorites: { email: string; eventId: string }[] = [
  { email: "ana@example.com", eventId: "caifanes-reunion" },
  { email: "ana@example.com", eventId: "coldplay" },
];
