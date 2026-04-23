import { stateTone, zoneTone, type SemanticState, type VaastuZone } from "@/lib/semantic-ui";

export function StateCard({
  title,
  description,
  state,
  zone,
  children
}: {
  title: string;
  description?: string;
  state: SemanticState;
  zone: VaastuZone;
  children?: React.ReactNode;
}) {
  const tone = stateTone(state);
  const zoneStyle = zoneTone(zone);

  return (
    <div className={`rounded-3xl border p-5 backdrop-blur-xl ${tone.panel} ${tone.glow} ring-1 ${zoneStyle.ring}`}>
      <div className="flex items-center justify-between">
        <div className={`text-base font-semibold ${zoneStyle.accent}`}>{title}</div>
        <div className={`rounded-full border px-3 py-1 text-xs ${tone.badge}`}>
          {state.toUpperCase()}
        </div>
      </div>
      {description ? <p className="mt-2 text-sm text-white/60">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
