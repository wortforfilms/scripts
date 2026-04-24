declare module "@libsql/client" {
  export type ExecuteResult = {
    rows: Array<Record<string, unknown>>;
  };

  export type LibsqlClient = {
    execute: (statement: string | { sql: string; args?: unknown[] }) => Promise<ExecuteResult>;
  };

  export function createClient(config: {
    url: string;
    authToken?: string;
  }): LibsqlClient;
}

declare module "@maataa/runtime-db" {
  export type RuntimeEventRecord = {
    id: string;
    source: string;
    type: string;
    state: string;
    time: string;
    payload?: unknown;
    [key: string]: unknown;
  };

  export function persistRuntimeEvent(event: Record<string, unknown>): Promise<RuntimeEventRecord>;
  export function listRuntimeEvents(limit?: number): Promise<RuntimeEventRecord[]>;
  export function persistRuntimeState(key: string, value: unknown): Promise<void>;
  export function getRuntimeState<T>(key: string, fallback: T): Promise<T>;
  export function listRuntimeState(): Promise<Record<string, unknown>>;
}

declare module "@maataa/ai-rj-training" {
  export type TrainingDataset = {
    records: unknown[];
    jsonl: string;
    stats: Record<string, unknown>;
    rejected?: unknown[];
  };

  export function buildAiRjTrainingDataset(
    events: Array<Record<string, unknown>>,
    options?: Record<string, unknown>
  ): TrainingDataset;
}
