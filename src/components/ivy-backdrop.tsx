// Crests live in public/assets/crests and are committed to Git, so they work on
// any host (Vercel included) without depending on external CDN infrastructure.
const crest = (name: string) => `/assets/crests/${name}.png`;

type Crest = {
  name: string;
  src: string;
  top: string;
  size: number;
  delay: string;
  dur: string;
  tilt: number;
  reverse?: boolean;
};

const IVY: Crest[] = [
  {
    name: "Harvard",
    src: crest("harvard"),
    top: "12%",
    size: 92,
    delay: "0s",
    dur: "58s",
    tilt: -6,
  },
  {
    name: "Yale",
    src: crest("yale"),
    top: "24%",
    size: 78,
    delay: "-22s",
    dur: "72s",
    tilt: 7,
    reverse: true,
  },
  {
    name: "Princeton",
    src: crest("princeton"),
    top: "38%",
    size: 84,
    delay: "-9s",
    dur: "64s",
    tilt: 5,
  },
  {
    name: "Columbia",
    src: crest("columbia"),
    top: "52%",
    size: 72,
    delay: "-35s",
    dur: "80s",
    tilt: -8,
    reverse: true,
  },
  {
    name: "Brown",
    src: crest("brown"),
    top: "6%",
    size: 84,
    delay: "-46s",
    dur: "76s",
    tilt: 3,
    reverse: true,
  },
  {
    name: "Cornell",
    src: crest("cornell"),
    top: "66%",
    size: 66,
    delay: "-16s",
    dur: "62s",
    tilt: -4,
  },
  {
    name: "Dartmouth",
    src: crest("dartmouth"),
    top: "78%",
    size: 64,
    delay: "-52s",
    dur: "70s",
    tilt: 9,
    reverse: true,
  },
  { name: "Penn", src: crest("penn"), top: "88%", size: 80, delay: "-30s", dur: "66s", tilt: -5 },
];

export function IvyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ivy-veil absolute inset-0" />
      {IVY.map((c) => (
        <div
          key={c.name}
          className={c.reverse ? "ivy-track ivy-track-reverse absolute" : "ivy-track absolute"}
          style={{ top: c.top, animationDelay: c.delay, animationDuration: c.dur }}
        >
          <span className="ivy-bob block" style={{ animationDelay: c.delay }}>
            <img
              src={c.src}
              alt=""
              loading="lazy"
              width={c.size}
              height={c.size * 1.16}
              style={{ width: c.size, height: c.size * 1.16, transform: `rotate(${c.tilt}deg)` }}
              className="ivy-crest object-contain"
            />
          </span>
        </div>
      ))}
    </div>
  );
}
