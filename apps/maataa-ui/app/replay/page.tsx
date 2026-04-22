"use client";

import { useEffect, useState } from "react";

export default function ReplayPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/runtime/scheduler").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-6 text-white">Loading replay...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Scheduler Replay</h1>
      <div className="space-y-2">
        {data.logs.map((log: any) => (
          <div key={log.id} className="p-3 rounded bg-white/5 border border-white/10">
            <div>{log.type}</div>
            <div className="text-xs text-white/50">{log.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
