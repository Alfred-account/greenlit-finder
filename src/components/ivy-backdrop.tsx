import { useEffect, useRef, useState } from "react";

const IVY = [
  { name: "Harvard", motto: "VERITAS", top: "12%", left: "6%", size: 96, delay: "0s", dur: "22s", depth: 1 },
  { name: "Yale", motto: "LUX ET VERITAS", top: "26%", left: "82%", size: 80, delay: "-4s", dur: "26s", depth: 1.6 },
  { name: "Princeton", motto: "DEI SUB NUMINE", top: "68%", left: "12%", size: 88, delay: "-9s", dur: "24s", depth: 1.3 },
  { name: "Columbia", motto: "IN LUMINE TUO", top: "78%", left: "74%", size: 76, delay: "-13s", dur: "28s", depth: 1.9 },
  { name: "Brown", motto: "IN DEO SPERAMUS", top: "44%", left: "45%", size: 104, delay: "-6s", dur: "30s", depth: 0.8 },
  { name: "Cornell", motto: "I WOULD FOUND", top: "8%", left: "58%", size: 72, delay: "-16s", dur: "25s", depth: 2.1 },
  { name: "Dartmouth", motto: "VOX CLAMANTIS", top: "58%", left: "88%", size: 68, delay: "-11s", dur: "23s", depth: 1.1 },
  { name: "Penn", motto: "LEGES SINE MORIBUS", top: "84%", left: "34%", size: 84, delay: "-2s", dur: "27s", depth: 1.7 },
];

function Crest({ name, motto, size }: { name: string; motto: string; size: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" aria-hidden="true">
      <path
        d="M6 6h88v58c0 28-22 42-44 50C28 106 6 92 6 64V6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <path d="M6 30h88M50 6v108" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <text
        x="50"
        y="23"
        textAnchor="middle"
        fill="currentColor"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-display)"
      >
        {name}
      </text>
      <text x="50" y="80" textAnchor="middle" fill="currentColor" fontSize="7" letterSpacing="1.2" opacity="0.8">
        {motto}
      </text>
    </svg>
  );
}

export function IvyBackdrop() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setOffset({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {IVY.map((c) => (
        <div
          key={c.name}
          className="ivy-drift absolute text-primary/25"
          style={{
            top: c.top,
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.dur,
            transform: `translate3d(${offset.x * c.depth * 14}px, ${offset.y * c.depth * 14}px, 0)`,
          }}
        >
          <Crest name={c.name} motto={c.motto} size={c.size} />
        </div>
      ))}
    </div>
  );
}
