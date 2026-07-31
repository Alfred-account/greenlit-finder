import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход и регистрация — Green Lit Space" },
      {
        name: "description",
        content: "Войдите или создайте аккаунт Green Lit Space, чтобы сохранять олимпиады и конкурсы.",
      },
      { property: "og:title", content: "Вход и регистрация — Green Lit Space" },
      { property: "og:description", content: "Сохраняйте возможности в личном списке Green Lit Space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  const passwordTooShort = mode === "up" && password.length > 0 && password.length < 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "up") {
      if (!name.trim()) {
        toast.error(t("auth.needName"));
        return;
      }
      if (password.length < 8) {
        toast.error(t("auth.passwordShort"));
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcome"));
        navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: { full_name: name.trim() },
          },
        });
        if (error) throw error;
        setSent(true);
        toast.success(t("auth.checkEmail"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="hero-surface flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-2">
          <Button asChild variant="ghost" className="-ml-2 rounded-xl">
            <Link to="/">
              <ArrowLeft className="size-4" /> {t("share.back")}
            </Link>
          </Button>
          <LanguageSwitcher />
        </div>

        <div className="shadow-soft rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setSent(false);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "in" ? t("auth.tabIn") : t("auth.tabUp")}
              </button>
            ))}
          </div>

          <h1 className="mt-6 text-2xl font-bold">{mode === "in" ? t("auth.titleIn") : t("auth.titleUp")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "in" ? t("auth.subtitleIn") : t("auth.subtitleUp")}
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-primary/30 bg-accent/50 p-4 text-sm">
              <Mail className="mb-2 size-5 text-primary" />
              {t("auth.checkEmail")}
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onGoogle}
                className="mt-6 h-11 w-full rounded-xl border-primary/40"
              >
                <LogIn className="size-4" /> {t("auth.google")}
              </Button>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <Mail className="size-3.5" />
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "up" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("auth.name")}</Label>
                    <Input
                      required
                      maxLength={80}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("auth.namePlaceholder")}
                      className="h-11 rounded-xl"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm">{t("auth.email")}</Label>
                  <Input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t("auth.password")}</Label>
                  <Input
                    required
                    minLength={mode === "up" ? 8 : 6}
                    type="password"
                    autoComplete={mode === "in" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                  {mode === "up" && (
                    <p className={`text-xs ${passwordTooShort ? "text-destructive" : "text-muted-foreground"}`}>
                      {passwordTooShort ? t("auth.passwordShort") : t("auth.passwordHint")}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="gradient-emerald h-11 w-full rounded-xl text-primary-foreground"
                >
                  {mode === "in" ? (
                    <>
                      <LogIn className="size-4" /> {t("auth.signIn")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" /> {t("auth.createAccount")}
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "in" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setSent(false);
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "in" ? t("auth.tabUp") : t("auth.tabIn")}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
