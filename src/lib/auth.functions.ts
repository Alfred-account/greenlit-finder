import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function serverAuthClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Is this username still free? Only exposes a boolean, never an email. */
export const checkUsername = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const username = data.username.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) return { available: false, invalid: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    return { available: !row, invalid: false };
  });

/**
 * Sign in with either an email or a username. The username → email lookup
 * happens server-side only, so no email address is ever exposed to the client;
 * a session comes back only when the password is correct.
 */
export const signInWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string; password: string }) => data)
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    if (!identifier || !data.password) return { error: "invalid" as const };

    let email = identifier;
    if (!identifier.includes("@")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", identifier.toLowerCase())
        .maybeSingle();
      if (!row) return { error: "invalid" as const };
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(row.id);
      if (!userRes?.user?.email) return { error: "invalid" as const };
      email = userRes.user.email;
    }

    const { data: signed, error } = await serverAuthClient().auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (error || !signed.session) {
      return { error: error?.message === "Email not confirmed" ? ("unconfirmed" as const) : ("invalid" as const) };
    }
    return {
      session: {
        access_token: signed.session.access_token,
        refresh_token: signed.session.refresh_token,
      },
    };
  });
