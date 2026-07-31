import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Display name from the profile (falls back to sign-up metadata, then email). */
  displayName: string | null;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, displayName: null });

function metadataName(user: User | null) {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name = (meta?.full_name ?? meta?.name) as string | undefined;
  return name?.trim() || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setProfileName(null);
      return;
    }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfileName(data?.full_name?.trim() || null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      session,
      user,
      loading,
      displayName: profileName ?? metadataName(user) ?? user?.email?.split("@")[0] ?? null,
    };
  }, [session, loading, profileName]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
