// Logos live in public/assets/logos and are committed to Git, so they work on
// any host without depending on external CDN infrastructure.
const logo = (name: string) => `/assets/logos/${name}.png`;

type Mark = {
  name: string;
  /** Logo width in px (scaled down on small screens by the wrapper). */
  size: number;
  /** Orbit radius as a multiple of the responsive ring radius. */
  ring: number;
  /** Starting angle on the ring, in degrees. */
  angle: number;
  /** Seconds for a full revolution. */
  dur: number;
  /** Counter-clockwise when true. */
  reverse?: boolean;
  /** Hidden on small screens, where the ring has less room. */
  desktopOnly?: boolean;
};

/** Olympiad, contest and programme logos orbiting around the hero copy. */
const MARKS: Mark[] = [
  { name: "uwc", size: 84, ring: 1, angle: 0, dur: 76 },
  { name: "icpc", size: 72, ring: 1.16, angle: 40, dur: 92, reverse: true, desktopOnly: true },
  { name: "ioi", size: 78, ring: 1, angle: 72, dur: 84 },
  { name: "igem", size: 80, ring: 1.2, angle: 110, dur: 100, reverse: true },
  { name: "erasmus", size: 88, ring: 1, angle: 145, dur: 78 },
  { name: "flex", size: 72, ring: 1.18, angle: 180, dur: 96, reverse: true, desktopOnly: true },
  { name: "daryn", size: 82, ring: 1, angle: 214, dur: 88 },
  { name: "conrad", size: 86, ring: 1.22, angle: 250, dur: 104, reverse: true },
  { name: "daad", size: 76, ring: 1, angle: 288, dur: 80, desktopOnly: true },
  { name: "cern-openlab", size: 84, ring: 1.14, angle: 320, dur: 94, reverse: true },
  { name: "yale-ygs", size: 78, ring: 1.34, angle: 20, dur: 112, desktopOnly: true },
  { name: "space-settlement", size: 74, ring: 1.34, angle: 130, dur: 118, reverse: true, desktopOnly: true },
  { name: "ibo", size: 68, ring: 1.34, angle: 205, dur: 108, desktopOnly: true },
  { name: "gcc", size: 70, ring: 1.34, angle: 300, dur: 122, reverse: true, desktopOnly: true },
];

export function IvyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ivy-veil absolute inset-0" />
      <div
        className="ivy-orbit-field [--ivy-ellipse:1.1] [--ivy-ring:clamp(170px,42vw,240px)] sm:[--ivy-ellipse:1.35] sm:[--ivy-ring:clamp(210px,34vw,300px)] lg:[--ivy-ellipse:1.6] lg:[--ivy-ring:clamp(240px,26vw,340px)]"
      >
        {MARKS.map((m) => {
          // Negative delay offsets the start angle without extra keyframes.
          const delay = `${-(m.angle / 360) * m.dur}s`;
          return (
            <div
              key={m.name}
              className={`ivy-orbit ${m.desktopOnly ? "hidden lg:block" : ""}`}
              style={
                {
                  "--ivy-dur": `${m.dur}s`,
                  "--ivy-dir": m.reverse ? "reverse" : "normal",
                  "--ivy-dir-counter": m.reverse ? "normal" : "reverse",
                  animationDelay: delay,
                } as React.CSSProperties
              }
            >
              <div
                className="ivy-orbit-mark"
                style={
                  {
                    "--ivy-r": `calc(var(--ivy-ring) * ${m.ring})`,
                    animationDelay: delay,
                  } as React.CSSProperties
                }
              >
                <img
                  src={logo(m.name)}
                  alt=""
                  loading="lazy"
                  width={m.size}
                  height={m.size}
                  style={{ width: m.size, height: "auto", marginLeft: -m.size / 2 }}
                  className="ivy-crest max-w-[18vw] object-contain sm:max-w-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
