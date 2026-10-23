import { useEffect, useRef } from "react";

import { OpportunityCard } from "@/components/opportunity-card";
import type { Opportunity } from "@/lib/opportunities";

type FeaturedStripProps = {
  items: Opportunity[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onOpen: (item: Opportunity) => void;
};

/** Native scrolling keeps touch inertia and horizontal trackpad gestures intact. */
export function FeaturedStrip({ items, isSaved, onToggleSave, onOpen }: FeaturedStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const pointerDown = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);

  function pause() {
    pausedUntil.current = performance.now() + 2500;
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let direction = 1;
    let position = viewport.scrollLeft;

    function animate(now: number) {
      if (!viewport) return;
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      const limit = viewport.scrollWidth - viewport.clientWidth;
      if (document.hidden || motion.matches || pointerDown.current || hovered.current || focused.current || now < pausedUntil.current || limit <= 1) {
        position = viewport.scrollLeft;
      } else {
        // Travel back gently at the ends, without duplicate cards or sudden jumps.
        position = Math.max(0, Math.min(limit, position + direction * elapsed * 0.018));
        viewport.scrollLeft = position;
        if (position >= limit || position <= 0) {
          direction *= -1;
          pausedUntil.current = now + 1200;
        }
      }
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [items]);

  return (
    <div
      ref={viewportRef}
      data-featured-strip
      className="featured-strip overflow-x-auto overscroll-x-contain py-2"
      onPointerDown={() => { pointerDown.current = true; pause(); }}
      onPointerUp={() => { pointerDown.current = false; pause(); }}
      onPointerCancel={() => { pointerDown.current = false; pause(); }}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") hovered.current = true; }}
      onPointerLeave={() => { hovered.current = false; pointerDown.current = false; pause(); }}
      onFocusCapture={() => { focused.current = true; }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { focused.current = false; pause(); } }}
      onWheel={pause}
      onTouchMove={pause}
    >
      <div className="featured-strip-track flex items-stretch gap-3 sm:gap-5">
        {items.map((item, index) => (
          <div key={item.id} className="featured-strip-item min-w-0 shrink-0">
            <OpportunityCard
              item={item}
              index={index}
              saved={isSaved(item.id)}
              onToggleSave={() => onToggleSave(item.id)}
              onOpen={() => onOpen(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}