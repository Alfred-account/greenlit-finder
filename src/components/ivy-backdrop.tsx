import { useEffect, useRef, useState } from "react";

import brown from "@/assets/crests/brown.png.asset.json";
import columbia from "@/assets/crests/columbia.png.asset.json";
import cornell from "@/assets/crests/cornell.png.asset.json";
import dartmouth from "@/assets/crests/dartmouth.png.asset.json";
import harvard from "@/assets/crests/harvard.png.asset.json";
import penn from "@/assets/crests/penn.png.asset.json";
import princeton from "@/assets/crests/princeton.png.asset.json";
import yale from "@/assets/crests/yale.png.asset.json";

type Crest = {
  name: string;
  src: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  dur: string;
  depth: number;
  tilt: number;
};

const IVY: Crest[] = [
  { name: "Harvard", src: harvard.url, top: "14%", left: "7%", size: 92, delay: "0s", dur: "19s", depth: 1, tilt: -6 },
  { name: "Yale", src: yale.url, top: "22%", left: "83%", size: 78, delay: "-4s", dur: "23s", depth: 1.6, tilt: 7 },
  { name: "Princeton", src: princeton.url, top: "66%", left: "11%", size: 84, delay: "-9s", dur: "21s", depth: 1.3, tilt: 5 },
  { name: "Columbia", src: columbia.url, top: "74%", left: "78%", size: 72, delay: "-13s", dur: "25s", depth: 1.9, tilt: -8 },
  { name: "Brown", src: brown.url, top: "8%", left: "27%", size: 84, delay: "-6s", dur: "27s", depth: 0.7, tilt: 3 },
  { name: "Cornell", src: cornell.url, top: "6%", left: "56%", size: 66, delay: "-16s", dur: "22s", depth: 2.1, tilt: -4 },
  { name: "Dartmouth", src: dartmouth.url, top: "56%", left: "89%", size: 64, delay: "-11s", dur: "20s", depth: 1.1, tilt: 9 },
  { name: "Penn", src: penn.url, top: "82%", left: "32%", size: 80, delay: "-2s", dur: "24s", depth: 1.7, tilt: -5 },
];

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
      <div className="ivy-veil absolute inset-0" />
      {IVY.map((c) => (
        <div
          key={c.name}
          className="ivy-drift absolute"
          style={{
            top: c.top,
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.dur,
            transform: `translate3d(${offset.x * c.depth * 16}px, ${offset.y * c.depth * 16}px, 0)`,
          }}
        >
          <span className="ivy-halo block" style={{ width: c.size, height: c.size * 1.16 }}>
            <img
              src={c.src}
              alt=""
              loading="lazy"
              width={c.size}
              height={c.size * 1.16}
              style={{ ["--tilt" as string]: `${c.tilt}deg` }}
              className="ivy-crest h-full w-full object-contain"
            />
          </span>
        </div>
      ))}
    </div>
  );
}
