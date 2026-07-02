import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  eventSlug: string;
  eventName: string;
  zone: string;
  price: number;
  quantity: number;
  date: string;
  venue: string;
  emoji: string;
};

const KEY = "ft_cart";
const EVT = "ft_cart_change";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

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
    add: (item: Omit<CartItem, "id">) => {
      const cur = read();
      const existing = cur.find(
        (i) => i.eventSlug === item.eventSlug && i.zone === item.zone,
      );
      if (existing) {
        existing.quantity += item.quantity;
        write(cur);
      } else {
        write([...cur, { ...item, id: crypto.randomUUID() }]);
      }
    },
    remove: (id: string) => write(read().filter((i) => i.id !== id)),
    updateQty: (id: string, qty: number) => {
      const cur = read();
      const it = cur.find((i) => i.id === id);
      if (!it) return;
      it.quantity = Math.max(1, qty);
      write(cur);
    },
    clear: () => write([]),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export function fees(subtotal: number) {
  const service = Math.round(subtotal * 0.12);
  const tax = Math.round(subtotal * 0.16);
  return { service, tax, total: subtotal + service + tax };
}
