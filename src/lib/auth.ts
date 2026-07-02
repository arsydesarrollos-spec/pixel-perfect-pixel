import { useEffect, useState } from "react";
import { mockUsers, type MockUser } from "@/lib/mockDb";

// ---------- TYPES ----------
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  photo?: string;
  address?: string;
  location?: string;
  credits?: number;
};

type AuthResult = { success: true; user: AuthUser } | { success: false; error: string };

const KEY = "ft_user";
const EVT = "ft_auth_change";
const OPEN_LOGIN_EVT = "ft_open_login";

function toAuthUser(u: MockUser): AuthUser {
  const { password: _password, ...safe } = u;
  return safe;
}

function readFrom(storage: Storage): AuthUser | null {
  try {
    const raw = storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function read(): AuthUser | null {
  if (typeof window === "undefined") return null;
  return readFrom(localStorage) ?? readFrom(sessionStorage);
}

// Returns whichever storage currently holds the session, or null if none does.
function currentStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(KEY)) return localStorage;
  if (sessionStorage.getItem(KEY)) return sessionStorage;
  return null;
}

function write(user: AuthUser | null, rememberMe: boolean) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  if (user) {
    (rememberMe ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(EVT));
}

// Persist updates back to whichever storage already holds the session.
function writeIntoExisting(user: AuthUser) {
  if (typeof window === "undefined") return;
  const target = currentStorage() ?? sessionStorage;
  target.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(EVT));
}

let runtimeUsers: MockUser[] = [...mockUsers];

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(read());
    setReady(true);
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
    ready,

    login: (email: string, password: string, rememberMe: boolean): AuthResult => {
      const found = runtimeUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!found) return { success: false, error: "Correo o contraseña incorrectos" };
      const safe = toAuthUser(found);
      write(safe, rememberMe);
      return { success: true, user: safe };
    },

    register: (
      name: string,
      email: string,
      password: string,
      phone: string,
      rememberMe: boolean,
    ): AuthResult => {
      const exists = runtimeUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) return { success: false, error: "Ya existe una cuenta con ese correo" };
      const newUser: MockUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        credits: 0,
      };
      runtimeUsers = [...runtimeUsers, newUser];
      const safe = toAuthUser(newUser);
      write(safe, rememberMe);
      return { success: true, user: safe };
    },

    // Merge and persist partial changes onto the current session.
    updateUser: (patch: Partial<AuthUser>) => {
      const current = read();
      if (!current) return;
      const next: AuthUser = { ...current, ...patch };
      // Mirror into the runtime user list too, so mock queries stay consistent.
      runtimeUsers = runtimeUsers.map((u) => (u.email === current.email ? { ...u, ...patch } : u));
      writeIntoExisting(next);
    },

    logout: () => write(null, false),
  };
}

export function requestLogin() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_LOGIN_EVT));
}

export function useOpenLoginListener(onOpen: () => void) {
  useEffect(() => {
    window.addEventListener(OPEN_LOGIN_EVT, onOpen);
    return () => window.removeEventListener(OPEN_LOGIN_EVT, onOpen);
  }, [onOpen]);
}
