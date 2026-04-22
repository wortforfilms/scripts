"use client";

import { useEffect, useState } from "react";

export default function Section65BPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/legal/65b").then(r => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div className="p-6 text-white">Loading affidavit scaffold...</div>;
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-yellow-300">Section 65B Affidavit (Scaffold)</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Deponent</div>
          <div className="mt-2">{data.deponent.name}</div>
          <div className="text-xs text-white/60">{data.deponent.role} • {data.deponent.organization}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Statement</div>
          <p className="mt-2 text-sm text-white/80">{data.statement.summary}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Annexures</div>
          <ul className="mt-3 space-y-2">
            {data.annexures.map((a: any, i: number) => (
              <li key={i} className="text-sm text-white/80">
                {a.label}: {a.type} {a.value ?? a.recordId}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Latest Record</div>
          <pre className="mt-3 text-xs text-white/70 overflow-auto">
            {JSON.stringify(data.latestRecord, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
