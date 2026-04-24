import { FeatureGate } from "../../../components/access/FeatureGate";
import { listSpineAuditEvents, runDueSpineJobs } from "../../../lib/spine";

export const metadata = { title: "Maataa Spine | Admin" };

export default async function AdminSpinePage() {
  await runDueSpineJobs();
  const events = await listSpineAuditEvents(30);
  return (
    <FeatureGate featureKey="adminSpine">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Maataa Spine</h1>
        <div className="mt-6 grid gap-3">
          {events.map((event) => (
            <div key={event.id} className="rounded border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between gap-4">
                <strong>{event.eventType}</strong>
                <span className="text-sm text-white/50">{event.createdAt}</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{event.subjectId ?? "system"}</p>
            </div>
          ))}
          {events.length === 0 ? <p className="text-white/60">No Spine audit events yet.</p> : null}
        </div>
      </main>
    </FeatureGate>
  );
}
