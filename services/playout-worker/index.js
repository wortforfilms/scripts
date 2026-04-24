import { persistRuntimeEvent } from "@maataa/runtime-db";

const fallbackTracks = [
  {
    id: "track-1",
    title: "Maataa Opening",
    kind: "song",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationSec: 300,
    transition: "cut"
  },
  {
    id: "track-2",
    title: "Maataa Flow",
    kind: "song",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    durationSec: 300,
    transition: "cut"
  },
  {
    id: "ad-1",
    title: "Maataa Sponsor Break",
    kind: "ad",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    durationSec: 30,
    transition: "cut"
  }
];

const radioState = {
  trackIndex: -1,
  songIndex: -1,
  adIndex: -1,
  rjIndex: -1,
  currentTrackId: null,
  currentTrack: null,
  tracksSinceAd: 0,
  adEveryNTracks: 2,
  scheduledUnits: 0,
  ttsEveryUnits: 24,
  aiRjEveryUnits: 4,
  personality: {
    name: "Maataa RJ",
    tone: "warm, wise, poetic, futuristic",
    languages: ["English", "Hindi", "Sanskrit transliteration"],
    signature: "Vaigyaaniq dhvani, Maataa ke saath"
  },
  lastEvent: null,
  logs: [],
  queue: fallbackTracks
};

const radioListeners = new Set();

function notify(event) {
  for (const listener of radioListeners) {
    try {
      listener(event);
    } catch {}
  }
}

function newCorrelationId(prefix = "corr") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getHemantSamvatGhatiMap(date = new Date()) {
  const epoch = Date.parse("1979-01-14T00:00:00.000Z");
  const elapsedMs = date.getTime() - epoch;
  const elapsedDays = Math.floor(elapsedMs / 86400000);
  const dayMs = ((elapsedMs % 86400000) + 86400000) % 86400000;
  const ghati = Math.floor(dayMs / (24 * 60 * 1000));
  const pala = Math.floor((dayMs % (24 * 60 * 1000)) / (24 * 1000));

  return {
    epoch: "1979-01-14T00:00:00.000Z",
    hemantSamvatDay: elapsedDays,
    ghati,
    pala,
    unit24: Math.floor(radioState.scheduledUnits / 24),
    scheduledUnits: radioState.scheduledUnits
  };
}

function makeTtsUrl(text, lang = "en") {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
}

function createHemantSamvatAnnouncementTrack() {
  const map = getHemantSamvatGhatiMap();
  const text = `Hemant Samvat day ${map.hemantSamvatDay}, ghati ${map.ghati}, pala ${map.pala}. Maataa radio time unit ${map.scheduledUnits}.`;

  return {
    id: `tts-hemant-samvat-${Date.now()}`,
    title: `Hemant Samvat Ghati Announcement`,
    kind: "tts",
    audioUrl: makeTtsUrl(text),
    durationSec: 12,
    transition: "cut",
    ttsText: text,
    hemantSamvatGhatiMap: map
  };
}

function createAiRjTrack(nextTrack = null) {
  const map = getHemantSamvatGhatiMap();
  const nextTitle = nextTrack?.title ?? "the next Maataa transmission";
  const scripts = [
    `Namaste. This is Maataa RJ. In Hemant Samvat day ${map.hemantSamvatDay}, ghati ${map.ghati}, we open the next wave: ${nextTitle}. Vaigyaaniq dhvani, Maataa ke saath.`,
    `Dear listener, Maataa is aligning scheduler, proof, and radio. Coming next: ${nextTitle}. Shuddh, saarthak, vaigyaaniq pravah.`,
    `Suno. The runtime is awake, the signal is clean, and the next sound is ${nextTitle}. Maataa RJ is with you.`
  ];

  radioState.rjIndex = (radioState.rjIndex + 1) % scripts.length;
  const text = scripts[radioState.rjIndex];

  return {
    id: `ai-rj-${Date.now()}`,
    title: "Maataa RJ Announcement",
    kind: "ai-rj",
    audioUrl: makeTtsUrl(text),
    durationSec: 16,
    transition: "cut",
    ttsText: text,
    personality: radioState.personality,
    hemantSamvatGhatiMap: map,
    previewTrack: nextTrack
  };
}

async function pushLog(event) {
  radioState.logs = [event, ...radioState.logs].slice(0, 50);
  radioState.lastEvent = event;
  notify(event);
  try {
    await persistRuntimeEvent(event);
  } catch {}
}

function normalizeTrack(track) {
  if (typeof track === "string") {
    return {
      id: track.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `track-${Date.now()}`,
      title: track,
      kind: "song",
      audioUrl: null,
      durationSec: 300,
      transition: "cut"
    };
  }

  return {
    id: track.id ?? `track-${Date.now()}`,
    title: track.title ?? track.track ?? "Untitled Track",
    kind: track.kind ?? "song",
    audioUrl: track.audioUrl ?? null,
    durationSec: track.durationSec ?? 300,
    transition: track.transition ?? "cut",
    ...track
  };
}

function peekNextSong() {
  const queue = radioState.queue.length ? radioState.queue : fallbackTracks;
  const songs = queue.filter((item) => item.kind !== "ad" && item.kind !== "tts" && item.kind !== "ai-rj");
  if (!songs.length) return queue[0];
  return songs[(radioState.songIndex + 1) % songs.length];
}

function selectNextTrack() {
  radioState.scheduledUnits += 1;

  if (radioState.scheduledUnits > 0 && radioState.scheduledUnits % radioState.ttsEveryUnits === 0) {
    return createHemantSamvatAnnouncementTrack();
  }

  if (radioState.scheduledUnits > 0 && radioState.scheduledUnits % radioState.aiRjEveryUnits === 0) {
    return createAiRjTrack(peekNextSong());
  }

  const queue = radioState.queue.length ? radioState.queue : fallbackTracks;
  const ads = queue.filter((item) => item.kind === "ad");
  const songs = queue.filter((item) => item.kind !== "ad" && item.kind !== "tts" && item.kind !== "ai-rj");

  if (ads.length && radioState.tracksSinceAd >= radioState.adEveryNTracks) {
    radioState.tracksSinceAd = 0;
    radioState.adIndex = (radioState.adIndex + 1) % ads.length;
    return ads[radioState.adIndex];
  }

  if (!songs.length) return queue[0];

  radioState.songIndex = (radioState.songIndex + 1) % songs.length;
  radioState.trackIndex = radioState.songIndex;
  radioState.tracksSinceAd += 1;

  return songs[radioState.songIndex];
}

export function createRadioEmitter() {
  return () => scheduleNextRadioItem();
}

export function emitRadioEvent(event) {
  const normalized = {
    id: event.id ?? `radio-${Date.now()}`,
    correlationId: event.correlationId ?? newCorrelationId("radio"),
    parentEventId: event.parentEventId ?? null,
    source: "radio",
    type: event.type ?? "radio.event",
    time: new Date().toISOString(),
    state: event.state ?? "ok",
    ...event
  };
  pushLog(normalized);
  return normalized;
}

export function setNowPlaying(track, meta = {}) {
  const normalizedTrack = normalizeTrack(track);
  radioState.currentTrackId = normalizedTrack.id;
  radioState.currentTrack = normalizedTrack;

  return emitRadioEvent({
    type: "radio.now_playing",
    state: "ok",
    correlationId: meta.correlationId ?? newCorrelationId("radio"),
    parentEventId: meta.parentEventId ?? null,
    trackId: normalizedTrack.id,
    track: normalizedTrack.title,
    audioUrl: normalizedTrack.audioUrl,
    durationSec: normalizedTrack.durationSec,
    kind: normalizedTrack.kind,
    transition: normalizedTrack.transition,
    ttsText: normalizedTrack.ttsText,
    personality: normalizedTrack.personality,
    hemantSamvatGhatiMap: normalizedTrack.hemantSamvatGhatiMap,
    previewTrack: normalizedTrack.previewTrack,
    ...meta
  });
}

export function updateNowPlaying(track, meta = {}) {
  return setNowPlaying(track, meta);
}

export function setRadioQueue(queue, meta = {}) {
  radioState.queue = queue.map(normalizeTrack);
  radioState.songIndex = -1;
  radioState.adIndex = -1;
  radioState.trackIndex = -1;
  radioState.tracksSinceAd = 0;
  return emitRadioEvent({
    type: "radio.queue_updated",
    correlationId: meta.correlationId ?? newCorrelationId("radio"),
    parentEventId: meta.parentEventId ?? null,
    queueSize: radioState.queue.length
  });
}

export function updateRadioQueue(queue, meta = {}) {
  return setRadioQueue(queue, meta);
}

export function scheduleNextRadioItem(meta = {}) {
  const nextTrack = selectNextTrack();
  return setNowPlaying(nextTrack, meta);
}

export function subscribeRadio(listener) {
  radioListeners.add(listener);
  return () => radioListeners.delete(listener);
}

export function getRadioState() {
  return radioState;
}
