import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";

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

/**
 * Spotlight overlay: dims and blocks everything except the highlighted filter,
 * so the user can only interact with the step they are being taught.
 * The tour can only be dismissed with the × button.
 */
export function TourOverlay({
  selector,
  title,
  text,
  index,
  total,
  onClose,
  onNext,
  nextLabel,
  showNext,
}: {
  selector: string | null;
  title: string;
  text: string;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  nextLabel?: string;
  showNext?: boolean;
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      const el = document.querySelector(selector);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    measure();
    const id = window.setInterval(measure, 200);
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
  const below = rect ? rect.top + rect.height + 14 : 0;
  const placeBelow = !rect || below + 210 < vh;
  const cardTop = rect ? (placeBelow ? below : Math.max(12, rect.top - 210)) : Math.max(24, vh / 2 - 110);
  const cardLeft = rect
    ? Math.min(Math.max(12, rect.left + rect.width / 2 - cardWidth / 2), Math.max(12, vw - cardWidth - 12))
    : Math.max(12, vw / 2 - cardWidth / 2);

  const block = "fixed bg-[#04150f]/65 backdrop-blur-[1px]";

  return createPortal(
    <div className="fixed inset-0 z-[9990]" role="dialog" aria-modal="true" aria-label={title}>
      {rect ? (
        <>
          <div className={block} style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }} />
          <div
            className={block}
            style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }}
          />
          <div className={block} style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }} />
          <div
            className={block}
            style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }}
          />
          <div
            className="pointer-events-none fixed rounded-2xl ring-2 ring-primary/80"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className={`${block} inset-0`} />
      )}

      <div
        className="shadow-lift fixed z-[10050] rounded-2xl border border-primary/30 bg-card p-4 text-left"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
          {index + 1} / {total}
        </p>
        <h3 className="mt-1 pr-7 text-base leading-snug font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
        {showNext && (
          <Button
            type="button"
            size="sm"
            onClick={onNext}
            className="gradient-emerald mt-3 w-full rounded-xl text-primary-foreground"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}
