import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
 * Spotlight overlay with a soft, rounded emerald highlight. The backdrop never
 * closes the tour — only the ✕ button, Esc, or finishing all steps do.
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
  const [popRect, setPopRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const frame = useRef(0);

  useEffect(() => setMounted(true), []);

  // Radix locks `body { pointer-events: none }` while a dropdown is open; if
  // the tour advances in the same tick the lock can outlive the dropdown and
  // freeze the page. Clearing it on every phase change keeps the UI alive.
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 60);
    return () => window.clearTimeout(id);
  }, [phase, selector]);

  useEffect(() => () => {
    document.body.style.pointerEvents = "";
  }, []);

  // Esc is one of the two allowed exits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const measure = useCallback(() => {
    const el = selector ? document.querySelector(selector) : null;
    if (!el) setRect(null);
    else {
      const r = el.getBoundingClientRect();
      setRect((prev) => {
        const next = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
        if (
          prev &&
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
        )
          return prev;
        return next;
      });
    }

    // Track an open dropdown / popover so the card never covers it.
    const pop = document.querySelector("[data-radix-popper-content-wrapper]");
    if (!pop) setPopRect(null);
    else {
      const p = (pop.firstElementChild ?? pop).getBoundingClientRect();
      setPopRect(
        p.width === 0 && p.height === 0 ? null : { top: p.top, left: p.left, width: p.width, height: p.height },
      );
    }
  }, [selector]);

  // Measuring every animation frame keeps the highlight glued to the element
  // while it scrolls or the layout shifts — no visible lag.
  useLayoutEffect(() => {
    if (selector) {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const loop = () => {
      measure();
      frame.current = window.requestAnimationFrame(loop);
    };
    loop();
    document.documentElement.classList.add("tour-active");
    return () => {
      window.cancelAnimationFrame(frame.current);
      document.documentElement.classList.remove("tour-active");
    };
  }, [measure, selector]);

  if (!mounted) return null;

  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const cardWidth = Math.min(360, vw - 24);
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

  // Area the card must avoid: the highlighted control plus any dropdown that
  // is currently open on top of it.
  let avoid: Rect | null = rect;
  if (rect && popRect) {
    const top = Math.min(rect.top, popRect.top);
    const left = Math.min(rect.left, popRect.left);
    avoid = {
      top,
      left,
      width: Math.max(rect.left + rect.width, popRect.left + popRect.width) - left,
      height: Math.max(rect.top + rect.height, popRect.top + popRect.height) - top,
    };
  }

  let cardTop = Math.max(24, vh / 2 - CARD_H / 2);
  let cardLeft = Math.max(12, vw / 2 - cardWidth / 2);

  if (avoid) {
    const spaceRight = vw - (avoid.left + avoid.width);
    const spaceLeft = avoid.left;
    const spaceAbove = avoid.top;
    const spaceBelow = vh - (avoid.top + avoid.height);

    if (spaceRight >= cardWidth + 28) {
      cardLeft = avoid.left + avoid.width + 16;
      cardTop = clamp(avoid.top, 12, vh - CARD_H - 12);
    } else if (spaceLeft >= cardWidth + 28) {
      cardLeft = avoid.left - cardWidth - 16;
      cardTop = clamp(avoid.top, 12, vh - CARD_H - 12);
    } else if (spaceAbove >= CARD_H + 20) {
      cardTop = avoid.top - CARD_H - 14;
      cardLeft = clamp(avoid.left + avoid.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    } else if (spaceBelow >= CARD_H + 20) {
      cardTop = avoid.top + avoid.height + 14;
      cardLeft = clamp(avoid.left + avoid.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    } else {
      // Nothing fits comfortably: pin to whichever half has more room.
      cardTop = spaceAbove > spaceBelow ? 12 : clamp(vh - CARD_H - 12, 12, vh);
      cardLeft = clamp(avoid.left + avoid.width / 2 - cardWidth / 2, 12, vw - cardWidth - 12);
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[9990] ${phase === "act" ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {rect ? (
        // One single element: the dimmed backdrop is painted by a huge soft
        // shadow around a rounded cut-out, so the edges stay smooth and the
        // whole thing glides in one piece — no seams, no lag.
        <div
          className="tour-spotlight pointer-events-none fixed"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      ) : (
        <div
          className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            phase === "act" ? "pointer-events-none" : ""
          }`}
        />
      )}

      <div
        className="tour-card shadow-lift pointer-events-auto fixed z-[10050] rounded-2xl border border-primary/40 bg-card p-4 text-left"
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
