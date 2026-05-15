"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function mapUser(u: SupabaseUser): Promise<User> {
  const { data } = await supabase
    .from("users")
    .select("plan")
    .eq("id", u.id)
    .single();

  return {
    id: u.id,
    name: u.user_metadata?.full_name || u.email || "Usuário",
    email: u.email || "",
    avatar_url: u.user_metadata?.avatar_url,
    plan: data?.plan || "free",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const mapped = await mapUser(session.user);
        if (mounted) setUser(mapped);
      } else {
        if (mounted) setUser(null);
      }
      if (mounted) setLoading(false);
      clearTimeout(fallbackTimer);
    }).catch(() => {
      if (mounted) setLoading(false);
      clearTimeout(fallbackTimer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      try {
        if (event === "SIGNED_OUT" || !session?.user) {
          if (mounted) setUser(null);
        } else {
          const mapped = await mapUser(session.user);
          if (mounted) setUser(mapped);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        clearTimeout(fallbackTimer);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}