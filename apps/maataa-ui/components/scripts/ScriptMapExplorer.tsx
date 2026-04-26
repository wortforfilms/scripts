"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Map as MapIcon, Satellite, ShieldCheck } from "lucide-react";
import type { ScriptRecord } from "../../lib/script-data";

type ScriptMapExplorerProps = {
  scripts: ScriptRecord[];
};

type Waypoint = {
  script: ScriptRecord;
  lat: number;
  lng: number;
};

type ThreeModule = typeof import("three");
type LeafletModule = typeof import("leaflet");

const waypointSlugs = ["latin", "hebrew", "aramaic", "kharosthi", "gandhari-manuscripts", "devanagari"];
const waypointCoords = [
  { lat: 26, lng: 14 },
  { lat: 55, lng: 30 },
  { lat: 42, lng: 50 },
  { lat: 64, lng: 70 },
  { lat: 35, lng: 87 },
  { lat: 18, lng: 62 }
];

function buildWaypoints(scripts: ScriptRecord[]): Waypoint[] {
  const bySlug = new globalThis.Map(scripts.map((script) => [script.slug, script]));
  const preferred = waypointSlugs.map((slug) => bySlug.get(slug)).filter((script): script is ScriptRecord => Boolean(script));
  return preferred.slice(0, waypointCoords.length).map((script, index) => ({ script, ...waypointCoords[index] }));
}

function statusClass(status: ScriptRecord["verificationStatus"]) {
  if (status === "VERIFIED") return "bg-emerald-400 text-emerald-950";
  if (status === "PARTIAL") return "bg-amber-300 text-amber-950";
  return "bg-slate-200 text-slate-950";
}

function makeMarkerHtml(waypoint: Waypoint, index: number) {
  const status = waypoint.script.verificationStatus.toLowerCase();
  return `
    <a class="script-map-pin script-map-pin-${status}" href="/scripts/${waypoint.script.slug}" aria-label="${waypoint.script.name}">
      <span class="script-map-pin-dot">${index + 1}</span>
      <span class="script-map-pin-label">${waypoint.script.name}</span>
    </a>
  `;
}

function initThreeScene(canvas: HTMLCanvasElement, three: ThreeModule) {
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 18);

  const renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new three.Group();
  scene.add(group);

  const material = new three.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 });
  for (let i = -8; i <= 8; i += 2) {
    const horizontal = new three.BufferGeometry().setFromPoints([new three.Vector3(-12, i, -2), new three.Vector3(12, i + 2.4, -2)]);
    const vertical = new three.BufferGeometry().setFromPoints([new three.Vector3(i, -8, -2), new three.Vector3(i + 2.4, 8, -2)]);
    group.add(new three.Line(horizontal, material));
    group.add(new three.Line(vertical, material));
  }

  const glowMaterial = new three.PointsMaterial({ color: 0xfacc15, size: 0.12, transparent: true, opacity: 0.9 });
  const points = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i += 1) {
    points[i * 3] = Math.random() * 20 - 10;
    points[i * 3 + 1] = Math.random() * 12 - 6;
    points[i * 3 + 2] = Math.random() * 2 - 1;
  }
  const particleGeometry = new three.BufferGeometry();
  particleGeometry.setAttribute("position", new three.BufferAttribute(points, 3));
  const particles = new three.Points(particleGeometry, glowMaterial);
  scene.add(particles);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
  }

  let frame = 0;
  let animationId = 0;
  function animate() {
    frame += 0.01;
    group.rotation.z = Math.sin(frame) * 0.025;
    particles.rotation.z = frame * 0.04;
    renderer.render(scene, camera);
    animationId = window.requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);

  return () => {
    window.removeEventListener("resize", resize);
    window.cancelAnimationFrame(animationId);
    particleGeometry.dispose();
    glowMaterial.dispose();
    material.dispose();
    renderer.dispose();
  };
}

function initLeafletMap(container: HTMLDivElement, leaflet: LeafletModule, waypoints: Waypoint[]) {
  const bounds: [[number, number], [number, number]] = [[0, 0], [80, 100]];
  const map = leaflet.map(container, {
    crs: leaflet.CRS.Simple,
    attributionControl: false,
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 0.7,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.25
  });

  map.fitBounds(bounds, { padding: [16, 16] });
  leaflet.rectangle(bounds, { color: "rgba(255,255,255,0.18)", weight: 1, fill: false }).addTo(map);
  leaflet
    .polyline(
      waypoints.map((waypoint) => [waypoint.lat, waypoint.lng] as [number, number]),
      { color: "white", dashArray: "4 8", weight: 3, opacity: 0.86 }
    )
    .addTo(map);

  waypoints.forEach((waypoint, index) => {
    const icon = leaflet.divIcon({
      className: "script-map-leaflet-icon",
      html: makeMarkerHtml(waypoint, index),
      iconSize: [148, 58],
      iconAnchor: [28, 58]
    });
    leaflet.marker([waypoint.lat, waypoint.lng], { icon, keyboard: true, title: waypoint.script.name }).addTo(map);
  });

  return () => map.remove();
}

export function ScriptMapExplorer({ scripts }: ScriptMapExplorerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const waypoints = useMemo(() => buildWaypoints(scripts), [scripts]);
  const verified = waypoints.filter((waypoint) => waypoint.script.verificationStatus === "VERIFIED").length;

  useEffect(() => {
    let cleanupThree: (() => void) | undefined;
    let cleanupLeaflet: (() => void) | undefined;
    let cancelled = false;

    async function loadEngines() {
      if (!canvasRef.current || !mapRef.current || waypoints.length === 0) return;
      try {
        const [three, leaflet] = await Promise.all([import("three"), import("leaflet")]);
        if (cancelled || !canvasRef.current || !mapRef.current) return;
        cleanupThree = initThreeScene(canvasRef.current, three);
        cleanupLeaflet = initLeafletMap(mapRef.current, leaflet, waypoints);
        setMapReady(true);
      } catch (error) {
        setEngineError(error instanceof Error ? error.message : "Map engine failed to load");
      }
    }

    void loadEngines();
    return () => {
      cancelled = true;
      cleanupLeaflet?.();
      cleanupThree?.();
    };
  }, [waypoints]);

  return (
    <section aria-labelledby="script-map-title" data-joyride="script-three-leaflet-map" className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-[#071018]">
      <div className="grid gap-0 lg:grid-cols-[0.76fr_1.24fr]">
        <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
            <Satellite className="h-4 w-4" aria-hidden="true" />
            Three.js + Leaflet route
          </div>
          <h2 id="script-map-title" className="mt-4 text-2xl font-semibold">Script proof navigation</h2>
          <p className="mt-3 text-sm leading-6 text-white/68">
            The route uses existing script records only. Verified points can show Unicode samples elsewhere; partial ancient links remain marked as verification work.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <strong className="block text-xl">{waypoints.length}</strong>
              <span className="text-white/60">route points</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <strong className="block text-xl">{verified}</strong>
              <span className="text-white/60">verified points</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {waypoints.map((waypoint) => (
              <Link key={waypoint.script.id} href={`/scripts/${waypoint.script.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 hover:bg-white/10">
                <span className={`h-2 w-2 rounded-full ${statusClass(waypoint.script.verificationStatus)}`} />
                {waypoint.script.name}
              </Link>
            ))}
          </div>
          {engineError ? <p className="mt-4 text-sm text-amber-200">Map engine warning: {engineError}</p> : null}
          {!mapReady && !engineError ? <p className="mt-4 text-sm text-white/55">Loading map engines...</p> : null}
        </div>
        <div className="relative min-h-[420px] bg-[linear-gradient(180deg,#0ea5c9_0%,#b9dfc6_39%,#1d8b3d_100%)]">
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70" aria-hidden="true" />
          <div ref={mapRef} className="script-map-container absolute inset-0 z-20" />
          <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex items-center gap-2 rounded-lg border border-white/20 bg-slate-950/65 px-3 py-2 text-xs text-white/85 backdrop-blur">
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            Leaflet simple CRS, offline-safe
          </div>
          <div className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-2 rounded-lg border border-white/20 bg-slate-950/65 px-3 py-2 text-xs text-white/85 backdrop-blur">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            No fake glyphs
          </div>
        </div>
      </div>
    </section>
  );
}
