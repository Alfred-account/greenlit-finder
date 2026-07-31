import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Аккаунт активирован — Green Lit Space" },
      {
        name: "description",
        content: "Ваш аккаунт Green Lit Space подтверждён. Сохраняйте олимпиады и конкурсы в личный список.",
      },
      { property: "og:title", content: "Аккаунт активирован — Green Lit Space" },
      { property: "og:description", content: "Почта подтверждена — добро пожаловать в Green Lit Space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <main className="hero-surface flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="shadow-soft rounded-2xl border border-border/70 bg-card p-6 text-center sm:p-9">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent">
            <CheckCircle2 className="size-9 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("welcome.title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("welcome.text")}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gradient-emerald h-12 rounded-xl text-primary-foreground">
              <Link to="/">
                {t("welcome.cta")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-primary/40">
                <Link to="/auth">{t("welcome.signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
