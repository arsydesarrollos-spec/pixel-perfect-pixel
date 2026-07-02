import { useEffect, useState } from "react";
import { mockUsers, type MockUser } from "./mockDb";

const KEY = "ft_user";
const EVT = "ft_auth_change";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
};

function sanitize(u: MockUser): AuthUser {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, isAdmin: !!u.isAdmin };
}

function read(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const l = localStorage.getItem(KEY);
    if (l) return JSON.parse(l);
    const s = sessionStorage.getItem(KEY);
    if (s) return JSON.parse(s);
    return null;
  } catch {
    return null;
  }
}

function persist(user: AuthUser, rememberMe: boolean) {
  // Clear both to avoid stale conflicts
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  const payload = JSON.stringify(user);
  if (rememberMe) localStorage.setItem(KEY, payload);
  else sessionStorage.setItem(KEY, payload);
  window.dispatchEvent(new Event(EVT));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(read());
    const h = () => setUser(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return {
    user,
    login: (email: string, password: string, rememberMe: boolean): AuthUser | null => {
      const match = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (!match) return null;
      const clean = sanitize(match);
      persist(clean, rememberMe);
      return clean;
    },
    register: (
      name: string,
      email: string,
      password: string,
      phone: string,
      rememberMe: boolean,
    ): AuthUser => {
      const existing = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const newUser: MockUser = existing ?? {
        id: "u_" + Math.random().toString(36).slice(2, 10),
        name,
        email,
        password,
        phone,
      };
      if (!existing) mockUsers.push(newUser);
      const clean = sanitize(newUser);
      persist(clean, rememberMe);
      return clean;
    },
    logout: () => {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
      window.dispatchEvent(new Event(EVT));
    },
  };
}
