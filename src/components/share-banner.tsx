import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";

import { useI18n } from "@/lib/i18n";

/**
 * Banner linking to the submission form. Its animation only runs while the
 * user actually engages with it: pointer hover, keyboard focus, or the banner
 * sitting in the middle of the viewport (what the user is looking at).
 */
export function ShareBanner() {
  const { t } = useI18n();
  const ref = useRef<HTMLAnchorElement>(null);
  const [engaged, setEngaged] = useState(false);
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setCentered(entry?.isIntersecting ?? false), {
      // Only the middle band of the screen counts as "being looked at".
      rootMargin: "-35% 0px -35% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const active = engaged || centered;

  return (
    <Link
      ref={ref}
      to="/share"
      data-active={active ? "" : undefined}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      className="share-cta shadow-soft mb-8 flex flex-col items-start gap-4 rounded-2xl border border-primary/25 bg-accent/50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 sm:mb-10 sm:flex-row sm:items-center sm:p-5"
    >
      <span className="share-cta-icon grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Megaphone className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <h2 className="block font-semibold">{t("banner.title")}</h2>
        <span className="block text-sm text-muted-foreground">{t("banner.subtitle")}</span>
      </span>
      <span className="share-cta-action w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground sm:w-auto">
        {t("banner.action")}
      </span>
    </Link>
  );
}
