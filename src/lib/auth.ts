import { useEffect, useState } from "react";
import { mockUsers, type MockUser } from "@/lib/mockDb";

// ---------- TYPES ----------
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
};

type AuthResult = { success: true; user: AuthUser } | { success: false; error: string };

const KEY = "ft_user";
const EVT = "ft_auth_change";
const OPEN_LOGIN_EVT = "ft_open_login";

function toAuthUser(u: MockUser): AuthUser {
  // Strip the password before it ever touches client state/storage.
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
  // localStorage (remembered sessions) takes priority, then sessionStorage (this-tab-only sessions).
  return readFrom(localStorage) ?? readFrom(sessionStorage);
}

function write(user: AuthUser | null, rememberMe: boolean) {
  if (typeof window === "undefined") return;
  // Always clear both first so a fresh login/register never leaves a stale
  // copy behind in the storage it did NOT choose this time.
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  if (user) {
    (rememberMe ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(EVT));
}

// In-memory registry so newly registered users can log back in during this session.
// Swap this whole file's internals for real API calls once a backend exists —
// the useAuth() hook's public shape below should not need to change.
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
      };
      runtimeUsers = [...runtimeUsers, newUser];
      const safe = toAuthUser(newUser);
      write(safe, rememberMe);
      return { success: true, user: safe };
    },

    logout: () => write(null, false),
  };
}

// Lets any component (e.g. a route guard) request that the login modal open,
// without needing to lift showLogin state up to a shared parent.
export function requestLogin() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_LOGIN_EVT));
}

export function useOpenLoginListener(onOpen: () => void) {
  useEffect(() => {
    window.addEventListener(OPEN_LOGIN_EVT, onOpen);
    return () => window.removeEventListener(OPEN_LOGIN_EVT, onOpen);
  }, [onOpen]);
}
