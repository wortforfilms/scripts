export type RuntimeEvent = {
  id: string;
  time: string;
  type: string;
  state: "ok" | "warn" | "critical";
};

export type ServiceNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
};
