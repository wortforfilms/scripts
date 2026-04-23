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

function pushLog(event) {
  proofState.logs = [event, ...proofState.logs].slice(0, 50);
  proofState.lastEvent = event;
  notify(event);
}

export function createProofEmitter() {
  return () => {
    proofState.batches += 1;
    const event = {
      id: `proof-${proofState.batches}`,
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

export function subscribeProof(listener) {
  proofListeners.add(listener);
  return () => proofListeners.delete(listener);
}

export function getProofState() {
  return proofState;
}
