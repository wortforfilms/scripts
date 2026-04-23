import { persistRuntimeEvent } from "@maataa/runtime-db";

const proofState = {
  batches: 0,
  lastEvent: null,
  logs: []
};

const proofListeners = new Set();

function notify(event) {
  for (const listener of proofListeners) {
    try {
      listener(event);
    } catch {}
  }
}

function newCorrelationId(prefix = "corr") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function pushLog(event) {
  proofState.logs = [event, ...proofState.logs].slice(0, 50);
  proofState.lastEvent = event;
  notify(event);
  try {
    await persistRuntimeEvent(event);
  } catch {}
}

export function createProofEmitter() {
  return () => {
    proofState.batches += 1;
    const correlationId = newCorrelationId("proof");
    const event = {
      id: `proof-${proofState.batches}`,
      correlationId,
      parentEventId: null,
      source: "proof",
      type: "proof.generated",
      time: new Date().toISOString(),
      state: proofState.batches % 3 === 0 ? "warn" : "ok",
      batch: proofState.batches
    };
    pushLog(event);
    return event;
  };
}

export function emitProofEvent(event) {
  const normalized = {
    id: event.id ?? `proof-${Date.now()}`,
    correlationId: event.correlationId ?? newCorrelationId("proof"),
    parentEventId: event.parentEventId ?? null,
    source: "proof",
    type: event.type ?? "proof.event",
    time: event.time ?? new Date().toISOString(),
    state: event.state ?? "ok",
    ...event
  };
  pushLog(normalized);
  return normalized;
}

export function subscribeProof(listener) {
  proofListeners.add(listener);
  return () => proofListeners.delete(listener);
}

export function getProofState() {
  return proofState;
}
