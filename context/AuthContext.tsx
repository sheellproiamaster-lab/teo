"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teo_session");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const getUsers = (): StoredUser[] => {
    try { return JSON.parse(localStorage.getItem("teo_users") || "[]"); }
    catch { return []; }
  };

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: "E-mail ou senha incorretos" };
    const { password: _, ...session } = found;
    setUser(session);
    localStorage.setItem("teo_session", JSON.stringify(session));
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "E-mail já cadastrado" };
    const newUser: StoredUser = { id: crypto.randomUUID(), name, email, password, createdAt: new Date().toISOString() } as any;
    users.push(newUser);
    localStorage.setItem("teo_users", JSON.stringify(users));
    const { password: _, ...session } = newUser;
    setUser(session);
    localStorage.setItem("teo_session", JSON.stringify(session));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("teo_session");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
