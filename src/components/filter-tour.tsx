import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, HelpCircle, MousePointerClick, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/** Button that starts the guided walkthrough of the filter panel. */
export function FilterTourButton({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onStart}
      aria-label={t("help.tooltip")}
      title={t("help.tooltip")}
      className="size-11 shrink-0 rounded-xl border-primary/40 text-primary transition-transform hover:scale-105"
    >
      <HelpCircle className="size-5" />
    </Button>
  );
}

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 10;
const CARD_H = 220;

export type TourPhase = "explain" | "act" | "success";

/**
 * Spotlight overlay with a neon emerald highlight. The backdrop never closes
 * the tour — only the ✕ button, Esc, or finishing all steps do.
 * The card is placed in the largest free area so it can never sit on top of
 * the highlighted control or its opened dropdown.
 */
export function TourOverlay({
  selector,
  title,
  text,
  phase,
  index,
  total,
  onClose,
  onGotIt,
  onSkip,
  showSkip,
  isLast,
}: {
  selector: string | null;
  title: string;
  text: string;
  phase: TourPhase;
  index: number;
  total: number;
  onClose: () => void;
  onGotIt: () => void;
  onSkip: () => void;
  showSkip?: boolean;
  isLast?: boolean;
}) {
  const { t } = useI18n();
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Esc is one of the two allowed exits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const measure = useCallback(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [selector]);

  useLayoutEffect(() => {
    if (selector) {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    measure();
    const id = window.setInterval(measure, 150);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    document.documentElement.classList.add("tour-active");
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      document.documentElement.classList.remove("tour-active");
    };
  }, [measure, selector]);

  if (!mounted) return null;

  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const cardWidth = Math.min(360, vw - 24);
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

  // Free space on each side of the highlighted control. During the "act"
  // phase a dropdown usually opens downwards, so below-space is discounted.
  let cardTop = Math.max(24, vh / 2 - CARD_H / 2);
  let cardLeft = Math.max(12, vw / 2 - cardWidth / 2);

  if (rect) {
    const spaceRight = vw - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const spaceAbove = rect.top;
    const spaceBelow = vh - (rect.top + rect.height) - (phase === "act" ? 300 : 0);

    if (spaceRight >= cardWidth + 28) {
      cardLeft = rect.left + rect.width + 16;
      cardTop = clamp(rect.top, 12, vh - CARD_H - 12);
    } else if (spaceLeft >= cardWidth + 28) {
      cardLeft = rect.left - cardWidth - 16;
      cardTop = clamp(rect.top, 12, vh - CARD_H - 12);
    } else if (spaceAbove >= CARD_H + 20) {
      cardTop = rect.top - CARD_H - 14;
      cardLeft = clamp(rect.left + rect.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    } else if (spaceBelow >= CARD_H + 20) {
      cardTop = rect.top + rect.height + 14;
      cardLeft = clamp(rect.left + rect.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    } else {
      // Nothing fits comfortably: pin to whichever half has more room.
      cardTop = spaceAbove > vh - spaceAbove ? 12 : clamp(vh - CARD_H - 12, 12, vh);
      cardLeft = clamp(rect.left + rect.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    }
  }

  const block = "fixed bg-black/45 backdrop-blur-[2px]";

  return createPortal(
    <div className="fixed inset-0 z-[9990]" role="dialog" aria-modal="true" aria-label={title}>
      {rect ? (
        <>
          <div className={block} style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }} />
          <div className={block} style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }} />
          <div className={block} style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }} />
          <div className={block} style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
          <div
            className="tour-spotlight pointer-events-none fixed"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className={`${block} inset-0`} />
      )}

      <div
        className="shadow-lift fixed z-[10050] rounded-2xl border border-primary/40 bg-card p-4 text-left transition-all duration-300 ease-in-out"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("tour.close")}
          className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {phase === "success" ? (
          <div className="flex items-center gap-3 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-5" />
            </span>
            <p className="text-base font-semibold text-primary">{t("tour.great")}</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
              {index + 1} / {total}
            </p>
            <h3 className="mt-1 flex items-center gap-2 pr-7 text-base leading-snug font-semibold">
              {isLast && <Sparkles className="size-4 shrink-0 text-primary" />}
              {title}
            </h3>

            {phase === "explain" ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={isLast ? onClose : onGotIt}
                  className="gradient-emerald mt-3 w-full rounded-xl text-primary-foreground"
                >
                  {isLast ? t("tour.showResults") : t("tour.gotIt")}
                </Button>
              </>
            ) : (
              <>
                <p className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-2 text-sm font-medium text-accent-foreground">
                  <MousePointerClick className="size-4 shrink-0 text-primary" />
                  {t("tour.pickBelow")}
                </p>
                {showSkip && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onSkip}
                    className="mt-2 w-full rounded-xl text-muted-foreground"
                  >
                    {t("tour.skipStep")}
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
