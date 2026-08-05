import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye, EyeOff, LogIn, Mail, UserPlus } from "lucide-react";

import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { checkUsername, signInWithIdentifier, USERNAME_RE } from "@/lib/auth.functions";
import { sampleName, useI18n } from "@/lib/i18n";


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
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const signIn = useServerFn(signInWithIdentifier);
  const checkName = useServerFn(checkUsername);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const namePlaceholder = useMemo(() => sampleName(lang), [lang]);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  const passwordTooShort = mode === "up" && password.length > 0 && password.length < 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const res = await signIn({ data: { identifier, password } });
        if ("error" in res && res.error) {
          toast.error(t("auth.badCredentials"));
          return;
        }
        if ("session" in res && res.session) {
          const { error } = await supabase.auth.setSession(res.session);
          if (error) throw error;
          toast.success(t("auth.welcome"));
          navigate({ to: "/", replace: true });
        }
      } else {
        if (!name.trim()) {
          toast.error(t("auth.needName"));
          return;
        }
        if (!USERNAME_RE.test(username.trim())) {
          toast.error(t("auth.badUsername"));
          return;
        }
        if (password.length < 8) {
          toast.error(t("auth.passwordShort"));
          return;
        }
        const check = await checkName({ data: { username: username.trim() } });
        if (!check.available) {
          toast.error(t("auth.usernameTaken"));
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim(), username: username.trim().toLowerCase() },
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

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
      if (error) throw error;
      toast.success(t("auth.codeVerified"));
      navigate({ to: "/welcome", replace: true });
    } catch {
      toast.error(t("auth.badCode"));
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(t("auth.codeResent"));
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
            <form onSubmit={verifyCode} className="mt-6 space-y-5">
              <div className="rounded-xl border border-primary/30 bg-accent/50 p-4 text-sm">
                <Mail className="mb-2 size-5 text-primary" />
                <p className="font-semibold">{t("auth.codeTitle")}</p>
                <p className="mt-1 text-muted-foreground">{t("auth.checkEmail")} <span className="font-medium text-foreground">{email}</span></p>
              </div>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                inputMode="numeric"
                pattern="[0-9]*"
                containerClassName="justify-center"
                aria-label={t("auth.codeLabel")}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} className="h-12 w-11 text-lg sm:w-12" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" disabled={busy || code.length !== 6} className="gradient-emerald h-11 w-full rounded-xl text-primary-foreground">
                {t("auth.verifyCode")}
              </Button>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => void resendCode()} className="w-full">
                {t("auth.resendCode")}
              </Button>
            </form>
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
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("auth.name")}</Label>
                      <Input
                        required
                        maxLength={80}
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={namePlaceholder}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("auth.username")}</Label>
                      <Input
                        required
                        maxLength={20}
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                        placeholder={t("auth.usernamePlaceholder")}
                        className="h-11 rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">{t("auth.usernameHint")}</p>
                    </div>

                  </>
                )}
                {mode === "up" ? (
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
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("auth.identifier")}</Label>
                    <Input
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@mail.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      required
                      minLength={mode === "up" ? 8 : 6}
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "in" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      title={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
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
