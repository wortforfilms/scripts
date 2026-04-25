import Link from "next/link";

export const metadata = {
  title: "Tools | Maataa Scripts",
  description: "Script verification and runtime tools."
};

export default function ToolsPage() {
  const tools = [
    ["Proof Inspector", "/proof-inspector"],
    ["Runtime Status", "/runtime"],
    ["Merkle Explorer", "/merkle"],
    ["Timeline", "/timeline"],
    ["Radio", "/radio"],
    ["Anchor", "/anchor"]
  ];
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Tools</h1>
      <p className="mt-3 max-w-2xl text-white/70">Operational tools are routed through the feature gate and backend guards where needed.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tools.map(([label, href]) => (
          <Link key={href} href={href} className="rounded border border-white/10 bg-white/5 p-5 hover:border-amber-300/60">
            <h2 className="text-xl font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-white/60">Open tool</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
