export function createRadioEmitter() {
  return () => ({
    type: "radio.now_playing",
    time: new Date().toISOString(),
    state: "ok"
  });
}
