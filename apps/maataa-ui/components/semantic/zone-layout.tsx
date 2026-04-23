import type { VaastuZone } from "@/lib/semantic-ui";

export function ZoneLayout({
  north,
  south,
  east,
  west,
  center
}: {
  north?: React.ReactNode;
  south?: React.ReactNode;
  east?: React.ReactNode;
  west?: React.ReactNode;
  center?: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6">{west}</div>
      <div className="space-y-6">{center}{south}</div>
      <div className="space-y-6">{east}{north}</div>
    </div>
  );
}
