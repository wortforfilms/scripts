export function createProofEmitter() {
  return () => ({
    type: "proof.generated",
    time: new Date().toISOString(),
    state: "ok"
  });
}
