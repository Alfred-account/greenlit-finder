// Logos live in public/assets/logos and are committed to Git, so they work on
// any host without depending on external CDN infrastructure.
const logo = (name: string) => `/assets/logos/${name}.png`;

type Mark = {
  name: string;
  src: string;
  top: string;
  size: number;
  delay: string;
  dur: string;
  tilt: number;
  reverse?: boolean;
};

/** Olympiad, contest and programme logos drifting across the hero. */
const MARKS: Mark[] = [
  { name: "uwc", src: logo("uwc"), top: "6%", size: 104, delay: "0s", dur: "62s", tilt: -5 },
  { name: "icpc", src: logo("icpc"), top: "14%", size: 92, delay: "-24s", dur: "78s", tilt: 6, reverse: true },
  { name: "ioi", src: logo("ioi"), top: "24%", size: 108, delay: "-9s", dur: "66s", tilt: 4 },
  { name: "igem", src: logo("igem"), top: "33%", size: 100, delay: "-40s", dur: "84s", tilt: -7, reverse: true },
  { name: "erasmus", src: logo("erasmus"), top: "42%", size: 132, delay: "-15s", dur: "72s", tilt: 3 },
  { name: "conrad", src: logo("conrad"), top: "51%", size: 128, delay: "-55s", dur: "88s", tilt: -3, reverse: true },
  { name: "flex", src: logo("flex"), top: "60%", size: 104, delay: "-31s", dur: "68s", tilt: 5 },
  { name: "daad", src: logo("daad"), top: "69%", size: 118, delay: "-12s", dur: "80s", tilt: -4, reverse: true },
  { name: "cern-openlab", src: logo("cern-openlab"), top: "78%", size: 126, delay: "-47s", dur: "74s", tilt: 4 },
  { name: "yale-ygs", src: logo("yale-ygs"), top: "87%", size: 116, delay: "-20s", dur: "90s", tilt: -6, reverse: true },
  { name: "yes", src: logo("yes"), top: "18%", size: 74, delay: "-63s", dur: "94s", tilt: 8 },
  { name: "space-settlement", src: logo("space-settlement"), top: "47%", size: 120, delay: "-70s", dur: "86s", tilt: -5, reverse: true },
  { name: "daryn", src: logo("daryn"), top: "64%", size: 124, delay: "-38s", dur: "96s", tilt: 3 },
  { name: "hansen", src: logo("hansen"), top: "82%", size: 84, delay: "-58s", dur: "82s", tilt: -8, reverse: true },
  { name: "gcc", src: logo("gcc"), top: "29%", size: 76, delay: "-75s", dur: "70s", tilt: 6 },
  { name: "ibo", src: logo("ibo"), top: "56%", size: 82, delay: "-27s", dur: "92s", tilt: -4, reverse: true },
];

export function IvyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ivy-veil absolute inset-0" />
      {MARKS.map((c) => (
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
              height={c.size}
              style={{ width: c.size, height: "auto", transform: `rotate(${c.tilt}deg)` }}
              className="ivy-crest object-contain"
            />
          </span>
        </div>
      ))}
    </div>
  );
}
