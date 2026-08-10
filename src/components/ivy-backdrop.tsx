// Logos live in public/assets/logos and are committed to Git, so they work on
// any host without depending on external CDN infrastructure.
const logo = (name: string) => `/assets/logos/${name}.png`;

type Mark = {
  name: string;
  /** Edge anchor — logos never enter the central area with the headline/CTA. */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  /** Drift axis and amplitude, kept small so marks stay near their edge. */
  axis: "x" | "y";
  dx: number;
  dy: number;
  dur: string;
  delay: string;
  tilt: number;
  /** Hidden on small screens where there is no free edge space. */
  desktopOnly?: boolean;
};

/** Olympiad, contest and programme logos drifting along the hero edges. */
const MARKS: Mark[] = [
  // top band
  { name: "uwc", top: "5%", left: "4%", size: 84, axis: "x", dx: 54, dy: 10, dur: "24s", delay: "0s", tilt: -5 },
  { name: "icpc", top: "3%", left: "26%", size: 72, axis: "x", dx: -46, dy: 14, dur: "29s", delay: "-6s", tilt: 6, desktopOnly: true },
  { name: "ioi", top: "6%", right: "24%", size: 78, axis: "x", dx: 48, dy: -12, dur: "27s", delay: "-11s", tilt: 4, desktopOnly: true },
  { name: "igem", top: "4%", right: "4%", size: 80, axis: "x", dx: -50, dy: 12, dur: "31s", delay: "-3s", tilt: -7 },
  // left edge
  { name: "erasmus", top: "26%", left: "2%", size: 88, axis: "y", dx: 14, dy: 70, dur: "30s", delay: "-8s", tilt: 3 },
  { name: "flex", top: "50%", left: "5%", size: 72, axis: "y", dx: -12, dy: -64, dur: "26s", delay: "-14s", tilt: 5, desktopOnly: true },
  { name: "daryn", top: "70%", left: "3%", size: 82, axis: "y", dx: 16, dy: -58, dur: "33s", delay: "-2s", tilt: -4 },
  // right edge
  { name: "conrad", top: "28%", right: "3%", size: 86, axis: "y", dx: -14, dy: 66, dur: "32s", delay: "-17s", tilt: -3 },
  { name: "daad", top: "52%", right: "5%", size: 76, axis: "y", dx: 12, dy: -60, dur: "28s", delay: "-5s", tilt: 4, desktopOnly: true },
  { name: "cern-openlab", top: "72%", right: "2%", size: 84, axis: "y", dx: -16, dy: -54, dur: "35s", delay: "-21s", tilt: 6 },
  // bottom band
  { name: "yale-ygs", bottom: "4%", left: "6%", size: 78, axis: "x", dx: 52, dy: -12, dur: "29s", delay: "-9s", tilt: -6 },
  { name: "space-settlement", bottom: "3%", left: "28%", size: 74, axis: "x", dx: -44, dy: -14, dur: "34s", delay: "-13s", tilt: -5, desktopOnly: true },
  { name: "ibo", bottom: "6%", right: "26%", size: 68, axis: "x", dx: 46, dy: 12, dur: "27s", delay: "-19s", tilt: -4, desktopOnly: true },
  { name: "gcc", bottom: "4%", right: "5%", size: 70, axis: "x", dx: -48, dy: -10, dur: "31s", delay: "-7s", tilt: 6 },
  { name: "hansen", top: "14%", left: "14%", size: 58, axis: "y", dx: 18, dy: 46, dur: "36s", delay: "-25s", tilt: -8, desktopOnly: true },
  { name: "yes", bottom: "14%", right: "14%", size: 56, axis: "y", dx: -18, dy: -44, dur: "38s", delay: "-15s", tilt: 8, desktopOnly: true },
];

export function IvyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ivy-veil absolute inset-0" />
      {MARKS.map((m) => (
        <div
          key={m.name}
          className={`absolute ${m.axis === "x" ? "ivy-drift-x" : "ivy-drift-y"} ${
            m.desktopOnly ? "hidden lg:block" : ""
          }`}
          style={
            {
              top: m.top,
              bottom: m.bottom,
              left: m.left,
              right: m.right,
              "--ivy-x": `${m.dx}px`,
              "--ivy-y": `${m.dy}px`,
              "--ivy-dur": m.dur,
              animationDelay: m.delay,
            } as React.CSSProperties
          }
        >
          <img
            src={logo(m.name)}
            alt=""
            loading="lazy"
            width={m.size}
            height={m.size}
            style={{ width: m.size, height: "auto", transform: `rotate(${m.tilt}deg)` }}
            className="ivy-crest object-contain"
          />
        </div>
      ))}
    </div>
  );
}
