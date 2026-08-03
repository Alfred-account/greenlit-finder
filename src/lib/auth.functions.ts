import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Publishable-key client. Deliberately avoids the service-role key so the app
 * works on any host (Vercel included) with only the public env vars set.
 */
function serverAuthClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
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
    const { data: free, error } = await serverAuthClient().rpc("username_available", { _username: username });
    // On an unexpected backend error don't block sign-up: the unique index
    // on profiles.username is the real guard.
    if (error) return { available: true, invalid: false };
    return { available: free !== false, invalid: false };
  });

/**
 * Sign in with either an email or a username. The username → email lookup runs
 * inside a database function that only answers when the password is correct,
 * so no email address can ever be discovered from a username.
 */
export const signInWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string; password: string }) => data)
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    if (!identifier || !data.password) return { error: "invalid" as const };

    const client = serverAuthClient();
    let email = identifier;
    if (!identifier.includes("@")) {
      const { data: found } = await client.rpc("username_login_email", {
        _username: identifier.toLowerCase(),
        _password: data.password,
      });
      if (!found) return { error: "invalid" as const };
      email = found as string;
    }

    const { data: signed, error } = await client.auth.signInWithPassword({ email, password: data.password });
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
