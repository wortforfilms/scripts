import Link from "next/link";
import { Compass, MapPin, Navigation, Route } from "lucide-react";
import type { ScriptRecord } from "../../lib/script-data";

type ScriptNavigationScreenProps = {
  scripts: ScriptRecord[];
  targetCount: number;
};

type Waypoint = {
  script: ScriptRecord;
  x: number;
  y: number;
};

const preferredWaypointSlugs = [
  "latin",
  "hebrew",
  "aramaic",
  "kharosthi",
  "gandhari-manuscripts",
  "central-asian-buddhist-transmission",
  "devanagari"
];

const waypointPositions = [
  { x: 13, y: 70 },
  { x: 31, y: 47 },
  { x: 54, y: 64 },
  { x: 75, y: 41 },
  { x: 88, y: 68 }
];

function buildWaypoints(scripts: ScriptRecord[]): Waypoint[] {
  const bySlug = new Map(scripts.map((script) => [script.slug, script]));
  const preferred = preferredWaypointSlugs.map((slug) => bySlug.get(slug)).filter((script): script is ScriptRecord => Boolean(script));
  const fallback = scripts.filter((script) => !preferred.includes(script)).slice(0, Math.max(0, 5 - preferred.length));

  return [...preferred, ...fallback].slice(0, 5).map((script, index) => ({
    script,
    ...waypointPositions[index]
  }));
}

function statusTone(status: ScriptRecord["verificationStatus"]) {
  if (status === "VERIFIED") return "border-emerald-200/80 bg-emerald-950/70 text-emerald-50";
  if (status === "PARTIAL") return "border-amber-200/80 bg-amber-950/70 text-amber-50";
  return "border-white/40 bg-slate-950/70 text-white";
}

export function ScriptNavigationScreen({ scripts, targetCount }: ScriptNavigationScreenProps) {
  const waypoints = buildWaypoints(scripts);
  const verifiedCount = scripts.filter((script) => script.verificationStatus === "VERIFIED").length;
  const partialCount = scripts.filter((script) => script.verificationStatus === "PARTIAL").length;
  const routePoints = waypoints.map((waypoint) => `${waypoint.x},${waypoint.y}`).join(" ");

  return (
    <section
      aria-labelledby="script-navigation-title"
      data-joyride="script-navigation-screen"
      className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/30"
    >
      <div className="relative min-h-[560px] bg-[linear-gradient(180deg,#049bd0_0%,#8fd8e8_30%,#c7d9aa_45%,#299639_72%,#08742f_100%)] text-white md:min-h-[500px]">
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] opacity-45">
          <div className="absolute left-[-12%] top-[12%] h-px w-[124%] rotate-[-8deg] bg-white/40" />
          <div className="absolute left-[-12%] top-[30%] h-px w-[124%] rotate-[-8deg] bg-white/30" />
          <div className="absolute left-[-12%] top-[52%] h-px w-[124%] rotate-[-8deg] bg-white/25" />
          <div className="absolute left-[10%] top-0 h-full w-px rotate-[16deg] bg-white/25" />
          <div className="absolute left-[38%] top-0 h-full w-px rotate-[16deg] bg-white/30" />
          <div className="absolute left-[66%] top-0 h-full w-px rotate-[16deg] bg-white/25" />
          <div className="absolute left-[86%] top-0 h-full w-px rotate-[16deg] bg-white/20" />
        </div>

        <div className="relative z-10 grid min-h-[560px] gap-6 p-5 sm:p-8 md:min-h-[500px] md:grid-cols-[0.78fr_1.22fr] md:items-center">
          <div className="max-w-md pt-5 md:pt-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/50 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Script navigation
            </div>
            <h2 id="script-navigation-title" className="mt-5 text-4xl font-semibold leading-tight text-white md:text-5xl">
              Choose a route through the script map.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/82">
              Browse known Unicode records and verification-required ancient links as real dataset waypoints.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-white/20 bg-slate-950/45 p-3 backdrop-blur">
                <span className="block text-xl font-semibold">{scripts.length}</span>
                <span className="text-white/70">mapped</span>
              </div>
              <div className="rounded-lg border border-white/20 bg-slate-950/45 p-3 backdrop-blur">
                <span className="block text-xl font-semibold">{verifiedCount}</span>
                <span className="text-white/70">verified</span>
              </div>
              <div className="rounded-lg border border-white/20 bg-slate-950/45 p-3 backdrop-blur">
                <span className="block text-xl font-semibold">{targetCount}</span>
                <span className="text-white/70">target</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#script-catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
              >
                Open catalog
                <Route className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/scripts/kharosthi"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kharosthi chain
              </Link>
            </div>
          </div>

          <div className="relative min-h-[300px] md:min-h-[390px]" aria-label="Script waypoint route">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Dotted route connecting script waypoints">
              <polyline
                points={routePoints}
                fill="none"
                stroke="rgba(255,255,255,0.92)"
                strokeDasharray="1.5 2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
            {waypoints.map((waypoint, index) => (
              <Link
                key={waypoint.script.id}
                href={`/scripts/${waypoint.script.slug}`}
                className="group absolute -translate-x-1/2 -translate-y-full text-center outline-none"
                style={{ left: `${waypoint.x}%`, top: `${waypoint.y}%` }}
              >
                <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-white/10 text-white shadow-lg shadow-black/25 backdrop-blur transition group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white">
                  <MapPin className="h-9 w-9 drop-shadow" aria-hidden="true" />
                  <span className="absolute top-3 text-xs font-bold text-slate-950">{index + 1}</span>
                </span>
                <span className={`mt-2 block max-w-[9rem] rounded-lg border px-2 py-1 text-xs font-semibold shadow-lg shadow-black/20 backdrop-blur ${statusTone(waypoint.script.verificationStatus)}`}>
                  <span className="block truncate">{waypoint.script.name}</span>
                  <span className="block truncate text-[10px] opacity-80">{waypoint.script.verificationStatus}</span>
                </span>
              </Link>
            ))}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 rounded-lg border border-white/25 bg-slate-950/55 px-3 py-2 text-xs text-white/85 backdrop-blur">
              <Compass className="h-4 w-4" aria-hidden="true" />
              {partialCount} partial records stay marked for verification
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
