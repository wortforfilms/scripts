const radioState = {
  trackIndex: 0,
  lastEvent: null,
  logs: []
};

const radioListeners = new Set();

const tracks = [
  "Om Resonance",
  "Dhatu Flow",
  "Cosmic Wave",
  "Anahata Pulse"
];

function notify(event) {
  for (const listener of radioListeners) {
    try {
      listener(event);
    } catch {}
  }
}

function pushLog(event) {
  radioState.logs = [event, ...radioState.logs].slice(0, 50);
  radioState.lastEvent = event;
  notify(event);
}

export function createRadioEmitter() {
  return () => {
    radioState.trackIndex = (radioState.trackIndex + 1) % tracks.length;
    const event = {
      id: `radio-${radioState.trackIndex}`,
      source: "radio",
      type: "radio.now_playing",
      time: new Date().toISOString(),
      state: "ok",
      track: tracks[radioState.trackIndex]
    };
    pushLog(event);
    return event;
  };
}

export function subscribeRadio(listener) {
  radioListeners.add(listener);
  return () => radioListeners.delete(listener);
}

export function getRadioState() {
  return radioState;
}
