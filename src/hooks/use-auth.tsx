import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; isAdmin: boolean; loading: boolean };
const AuthCtx = createContext<AuthState>({ user: null, isAdmin: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, loading: true });
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    const resolve = async (user: User | null) => {
      let isAdmin = false;
      if (user) {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        isAdmin = !!data;
      }
      setState({ user, isAdmin, loading: false });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setTimeout(() => resolve(session?.user ?? null), 0);
      router.invalidate();
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [router, qc]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export function useSignOut() {
  const qc = useQueryClient();
  const router = useRouter();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };
}
