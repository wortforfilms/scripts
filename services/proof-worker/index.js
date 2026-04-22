const proofState = {
  batches: 0,
  lastEvent: null,
  logs: []
};

function pushLog(event) {
  proofState.logs = [event, ...proofState.logs].slice(0, 50);
  proofState.lastEvent = event;
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

export function getProofState() {
  return proofState;
}
