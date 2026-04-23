import { persistRuntimeEvent } from "@maataa/runtime-db";

const radioState = {
  trackIndex: 0,
  lastEvent: null,
  logs: [],
  queue: []
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

async function pushLog(event) {
  radioState.logs = [event, ...radioState.logs].slice(0, 50);
  radioState.lastEvent = event;
  notify(event);
  try {
    await persistRuntimeEvent(event);
  } catch {}
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

export function emitRadioEvent(event) {
  const normalized = {
    id: event.id ?? `radio-${Date.now()}`,
    source: "radio",
    type: event.type ?? "radio.event",
    time: event.time ?? new Date().toISOString(),
    state: event.state ?? "ok",
    ...event
  };
  pushLog(normalized);
  return normalized;
}

export function updateNowPlaying(track) {
  const event = {
    id: `radio-${Date.now()}`,
    source: "radio",
    type: "radio.now_playing",
    time: new Date().toISOString(),
    state: "ok",
    track
  };
  pushLog(event);
  return event;
}

export function updateRadioQueue(queue) {
  radioState.queue = queue;
  emitRadioEvent({
    type: "radio.queue_updated",
    queueSize: queue.length
  });
}

export function subscribeRadio(listener) {
  radioListeners.add(listener);
  return () => radioListeners.delete(listener);
}

export function getRadioState() {
  return radioState;
}
