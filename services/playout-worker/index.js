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
  overrideActive: false,
  lastOverrideTrack: null,
  intelligentInterruptions: true,
  interruptionsToday: 0,
  maxInterruptionsPerDay: 12,
  lastInterruptionAt: null,
  llmProvider: process.env.AI_RJ_LLM_URL ? "http" : "template-fallback",
  onlinePolicy: {
    enabled: true,
    explorationRate: 0.15,
    interruptionBias: 0,
    phraseBias: {},
    reasonBias: {},
    moodBias: {}
  },
  learning: {
    scriptKnowledge: [],
    preferredPhrases: [],
    avoidPhrases: [],
    providerStats: {},
    reasonStats: {},
    moodStats: {}
  },
  memory: {
    playedHistory: [],
    listenerMood: "calm",
    sessionContext: {
      startedAt: new Date().toISOString(),
      theme: "Vaigyaaniq dhvani",
      notes: []
    }
  },
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

function bumpCounter(map, key) {
  const safeKey = key ?? "unknown";
  map[safeKey] = (map[safeKey] ?? 0) + 1;
}

function bumpBias(map, key, delta) {
  const safeKey = key ?? "unknown";
  map[safeKey] = Number(((map[safeKey] ?? 0) + delta).toFixed(3));
}

export function applyOnlineFeedback({ targetEventId, score = 0, reason = "feedback", phrase = null, mood = null }) {
  const delta = Math.max(-1, Math.min(1, Number(score) || 0)) * 0.1;
  if (!radioState.onlinePolicy.enabled) return radioState.onlinePolicy;

  radioState.onlinePolicy.interruptionBias = Number((radioState.onlinePolicy.interruptionBias + delta).toFixed(3));
  bumpBias(radioState.onlinePolicy.reasonBias, reason, delta);
  if (mood) bumpBias(radioState.onlinePolicy.moodBias, mood, delta);
  if (phrase) {
    bumpBias(radioState.onlinePolicy.phraseBias, phrase, delta);
    if (score > 0 && !radioState.learning.preferredPhrases.includes(phrase)) radioState.learning.preferredPhrases.push(phrase);
    if (score < 0 && !radioState.learning.avoidPhrases.includes(phrase)) radioState.learning.avoidPhrases.push(phrase);
  }

  return emitRadioEvent({
    type: "radio.online_policy_updated",
    state: "ok",
    targetEventId,
    score,
    reason,
    phrase,
    mood,
    onlinePolicy: radioState.onlinePolicy
  });
}

function cloneRadioState() {
  return {
    trackIndex: radioState.trackIndex,
    songIndex: radioState.songIndex,
    adIndex: radioState.adIndex,
    rjIndex: radioState.rjIndex,
    tracksSinceAd: radioState.tracksSinceAd,
    scheduledUnits: radioState.scheduledUnits,
    interruptionsToday: radioState.interruptionsToday,
    lastInterruptionAt: radioState.lastInterruptionAt,
    memory: JSON.parse(JSON.stringify(radioState.memory)),
    learning: JSON.parse(JSON.stringify(radioState.learning)),
    onlinePolicy: JSON.parse(JSON.stringify(radioState.onlinePolicy))
  };
}

function restoreRadioState(snapshot) {
  radioState.trackIndex = snapshot.trackIndex;
  radioState.songIndex = snapshot.songIndex;
  radioState.adIndex = snapshot.adIndex;
  radioState.rjIndex = snapshot.rjIndex;
  radioState.tracksSinceAd = snapshot.tracksSinceAd;
  radioState.scheduledUnits = snapshot.scheduledUnits;
  radioState.interruptionsToday = snapshot.interruptionsToday;
  radioState.lastInterruptionAt = snapshot.lastInterruptionAt;
  radioState.memory = snapshot.memory;
  radioState.learning = snapshot.learning;
  radioState.onlinePolicy = snapshot.onlinePolicy;
}

function updateListenerMood(track) {
  if (track.kind === "ad") return "commercial";
  if (track.kind === "ai-rj") return "guided";
  if (track.kind === "tts") return "reflective";
  if (track.title?.toLowerCase().includes("flow")) return "flowing";
  if (track.title?.toLowerCase().includes("opening")) return "fresh";
  return radioState.memory.listenerMood ?? "calm";
}

function rememberPlayedTrack(track, meta = {}) {
  const memoryItem = {
    id: track.id,
    title: track.title,
    kind: track.kind,
    time: new Date().toISOString(),
    scheduledUnit: radioState.scheduledUnits,
    mood: updateListenerMood(track),
    reason: meta.reason ?? track.reason ?? null
  };

  radioState.memory.playedHistory = [memoryItem, ...radioState.memory.playedHistory].slice(0, 24);
  radioState.memory.listenerMood = memoryItem.mood;
}

function learnFromAiRjScript(track) {
  if (track.kind !== "ai-rj" || !track.ttsText) return null;

  const text = String(track.ttsText);
  const knowledge = {
    id: `knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toISOString(),
    scheduledUnit: radioState.scheduledUnits,
    text,
    provider: track.scriptProvider ?? "unknown",
    mood: track.mood ?? radioState.memory.listenerMood,
    reason: track.reason ?? "unknown",
    length: text.length,
    recentTitles: getMemoryContext().recentTitles,
    previewTrackTitle: track.previewTrack?.title ?? null
  };

  radioState.learning.scriptKnowledge = [knowledge, ...radioState.learning.scriptKnowledge].slice(0, 100);
  bumpCounter(radioState.learning.providerStats, knowledge.provider);
  bumpCounter(radioState.learning.reasonStats, knowledge.reason);
  bumpCounter(radioState.learning.moodStats, knowledge.mood);

  if (text.includes("Vaigyaaniq dhvani") && !radioState.learning.preferredPhrases.includes("Vaigyaaniq dhvani")) {
    radioState.learning.preferredPhrases.push("Vaigyaaniq dhvani");
  }
  if (text.includes("Maataa ke saath") && !radioState.learning.preferredPhrases.includes("Maataa ke saath")) {
    radioState.learning.preferredPhrases.push("Maataa ke saath");
  }

  return knowledge;
}

function getLearningContext() {
  return {
    recentScripts: radioState.learning.scriptKnowledge.slice(0, 5),
    preferredPhrases: radioState.learning.preferredPhrases.slice(0, 8),
    avoidPhrases: radioState.learning.avoidPhrases.slice(0, 8),
    providerStats: radioState.learning.providerStats,
    reasonStats: radioState.learning.reasonStats,
    moodStats: radioState.learning.moodStats,
    onlinePolicy: radioState.onlinePolicy
  };
}

function getMemoryContext() {
  const recent = radioState.memory.playedHistory.slice(0, 5);
  return {
    listenerMood: radioState.memory.listenerMood,
    sessionContext: radioState.memory.sessionContext,
    recent,
    lastPlayed: recent[0] ?? null,
    recentKinds: recent.map((item) => item.kind),
    recentTitles: recent.map((item) => item.title)
  };
}

export function updateListenerContext(context = {}) {
  if (context.listenerMood) radioState.memory.listenerMood = context.listenerMood;
  if (context.note) {
    radioState.memory.sessionContext.notes = [
      { text: context.note, time: new Date().toISOString() },
      ...radioState.memory.sessionContext.notes
    ].slice(0, 20);
  }
  if (context.theme) radioState.memory.sessionContext.theme = context.theme;

  return emitRadioEvent({
    type: "radio.listener_context_updated",
    state: "ok",
    memory: getMemoryContext(),
    learning: getLearningContext()
  });
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

function fallbackAiRjScript(context) {
  const { map, memory, learning, nextTrack, mood, reason } = context;
  const nextTitle = nextTrack?.title ?? "the next Maataa transmission";
  const recentTitle = memory.lastPlayed?.title ?? "the previous sound";
  const preferred = learning.preferredPhrases.filter((phrase) => !learning.avoidPhrases.includes(phrase));
  const rememberedPhrase = preferred[0] ?? "Vaigyaaniq dhvani";
  const scripts = [
    `Namaste. This is Maataa RJ. Listener mood is ${mood}. We just heard ${recentTitle}. In Hemant Samvat day ${map.hemantSamvatDay}, ghati ${map.ghati}, we open the next wave: ${nextTitle}. ${rememberedPhrase}, Maataa ke saath.`,
    `Dear listener, Maataa remembers the flow: ${memory.recentTitles.join(", ") || "a fresh beginning"}. Coming next: ${nextTitle}. Shuddh, saarthak, ${rememberedPhrase}.`,
    `Suno. The session theme is ${memory.sessionContext.theme}. The runtime is awake, the signal is clean, and the next sound is ${nextTitle}. Maataa RJ is with you.`,
    `Intelligent interruption. Maataa RJ is briefly entering the stream because ${reason}. Mood is ${mood}. After this, the scheduler will resume cleanly with ${nextTitle}.`
  ].filter((script) => !learning.avoidPhrases.some((phrase) => script.includes(phrase)));

  radioState.rjIndex = (radioState.rjIndex + 1) % Math.max(1, scripts.length);
  return scripts[radioState.rjIndex] ?? `Maataa RJ: Coming next is ${nextTitle}.`;
}

async function generateAiRjScript(context) {
  const endpoint = process.env.AI_RJ_LLM_URL;
  if (!endpoint) {
    return { text: fallbackAiRjScript(context), provider: "template-fallback" };
  }

  const prompt = [
    "You are Maataa RJ, a warm, wise, poetic, futuristic AI radio jockey.",
    "Generate one short radio announcement under 45 words.",
    "Use gentle Hinglish with optional Sanskrit transliteration.",
    "Use learning from past scripts but avoid exact repetition.",
    "Respect online policy: prefer positively reinforced phrases and avoid negatively reinforced phrases.",
    "Do not include markdown. Do not mention you are an AI model.",
    `Mood: ${context.mood}`,
    `Reason: ${context.reason}`,
    `Next track: ${context.nextTrack?.title ?? "unknown"}`,
    `Recent tracks: ${context.memory.recentTitles.join(", ") || "none"}`,
    `Recent scripts: ${context.learning.recentScripts.map((item) => item.text).join(" | ") || "none"}`,
    `Preferred phrases: ${context.learning.preferredPhrases.join(", ") || "none"}`,
    `Avoid phrases: ${context.learning.avoidPhrases.join(", ") || "none"}`,
    `Online policy: ${JSON.stringify(context.learning.onlinePolicy)}`,
    `Session theme: ${context.memory.sessionContext.theme}`,
    `Hemant Samvat day: ${context.map.hemantSamvatDay}, ghati: ${context.map.ghati}, pala: ${context.map.pala}`
  ].join("\n");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) throw new Error(`LLM request failed: ${response.status}`);
    const data = await response.json();
    const text = data.text ?? data.script ?? data.response ?? data.message;
    if (!text) throw new Error("LLM response missing text");
    return { text: String(text).slice(0, 500), provider: "http-llm" };
  } catch {
    return { text: fallbackAiRjScript(context), provider: "template-fallback-after-error" };
  }
}

async function createAiRjTrack(nextTrack = null, options = {}) {
  const map = getHemantSamvatGhatiMap();
  const memory = getMemoryContext();
  const learning = getLearningContext();
  const mood = options.mood ?? memory.listenerMood ?? "steady";
  const reason = options.reason ?? "scheduled-rj";
  const scriptResult = options.script
    ? { text: options.script, provider: "explicit-script" }
    : await generateAiRjScript({ map, memory, learning, nextTrack, mood, reason, personality: radioState.personality });

  return {
    id: `ai-rj-${Date.now()}`,
    title: options.title ?? "Maataa RJ Announcement",
    kind: "ai-rj",
    audioUrl: makeTtsUrl(scriptResult.text),
    durationSec: options.durationSec ?? 16,
    transition: "cut",
    ttsText: scriptResult.text,
    scriptProvider: scriptResult.provider,
    personality: radioState.personality,
    hemantSamvatGhatiMap: map,
    previewTrack: nextTrack,
    memory,
    learning,
    mood,
    reason
  };
}

function shouldAiRjInterrupt(nextTrack) {
  const memory = getMemoryContext();
  const policyBoost = radioState.onlinePolicy.enabled ? radioState.onlinePolicy.interruptionBias : 0;
  const reasonBoost = radioState.onlinePolicy.reasonBias[nextTrack?.kind === "ad" ? "sponsor-break-context" : "unknown"] ?? 0;
  if (!radioState.intelligentInterruptions) return { interrupt: false, reason: "disabled" };
  if (radioState.overrideActive) return { interrupt: false, reason: "override-active" };
  if (radioState.interruptionsToday >= radioState.maxInterruptionsPerDay) return { interrupt: false, reason: "daily-limit" };
  if (nextTrack?.kind === "ad" && policyBoost + reasonBoost > -0.3) return { interrupt: true, reason: "sponsor-break-context", mood: "commercial" };
  if (memory.recentKinds.slice(0, 3).every((kind) => kind === "song") && memory.recentKinds.length >= 3 && policyBoost > -0.5) return { interrupt: true, reason: "three-song-memory-reset", mood: "guided" };
  if (memory.listenerMood === "commercial" && nextTrack?.kind === "song" && policyBoost > -0.5) return { interrupt: true, reason: "post-ad-rejoin", mood: "welcoming" };
  if (radioState.scheduledUnits > 0 && radioState.scheduledUnits % 6 === 0 && policyBoost > -0.5) return { interrupt: true, reason: "six-unit-context-reset", mood: "reflective" };
  return { interrupt: false, reason: "no-interruption-needed" };
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

async function selectProgrammedTrack() {
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

async function selectNextTrack() {
  radioState.scheduledUnits += 1;
  const programmedTrack = normalizeTrack(await selectProgrammedTrack());
  const decision = shouldAiRjInterrupt(programmedTrack);

  if (decision.interrupt) {
    radioState.interruptionsToday += 1;
    radioState.lastInterruptionAt = new Date().toISOString();
    return createAiRjTrack(programmedTrack, {
      title: "Maataa RJ Intelligent Interruption",
      reason: decision.reason,
      mood: decision.mood ?? "contextual"
    });
  }

  return programmedTrack;
}

export async function previewScheduledItems(count = 30) {
  const limit = Math.max(1, Math.min(Number(count) || 30, 200));
  const snapshot = cloneRadioState();

  try {
    const items = [];
    for (let index = 0; index < limit; index += 1) {
      const item = normalizeTrack(await selectNextTrack());
      items.push({
        index: index + 1,
        scheduledUnit: radioState.scheduledUnits,
        id: item.id,
        title: item.title,
        kind: item.kind,
        durationSec: item.durationSec,
        transition: item.transition,
        ttsText: item.ttsText,
        scriptProvider: item.scriptProvider,
        hemantSamvatGhatiMap: item.hemantSamvatGhatiMap,
        previewTrack: item.previewTrack,
        memory: item.memory,
        learning: item.learning,
        mood: item.mood,
        reason: item.reason
      });
    }
    return items;
  } finally {
    restoreRadioState(snapshot);
  }
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
    type: "radio.event",
    time: new Date().toISOString(),
    state: event.state ?? "ok",
    ...event
  };
  pushLog(normalized);
  return normalized;
}

export function setNowPlaying(track, meta = {}) {
  const normalizedTrack = normalizeTrack(track);
  rememberPlayedTrack(normalizedTrack, meta);
  const learnedScript = learnFromAiRjScript(normalizedTrack);
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
    scriptProvider: normalizedTrack.scriptProvider,
    personality: normalizedTrack.personality,
    hemantSamvatGhatiMap: normalizedTrack.hemantSamvatGhatiMap,
    previewTrack: normalizedTrack.previewTrack,
    memory: getMemoryContext(),
    learning: getLearningContext(),
    learnedScript,
    mood: normalizedTrack.mood ?? radioState.memory.listenerMood,
    reason: normalizedTrack.reason,
    ...meta
  });
}

export function forcePlayTrack(track, meta = {}) {
  const normalizedTrack = normalizeTrack(track);
  radioState.overrideActive = true;
  radioState.lastOverrideTrack = normalizedTrack;

  return setNowPlaying(normalizedTrack, {
    override: true,
    reason: meta.reason ?? "manual-preview-node-override",
    correlationId: meta.correlationId ?? newCorrelationId("override"),
    parentEventId: meta.parentEventId ?? null,
    ...meta
  });
}

export function resumeScheduler(meta = {}) {
  const wasOverride = radioState.overrideActive;
  const overrideTrack = radioState.lastOverrideTrack;
  radioState.overrideActive = false;
  radioState.lastOverrideTrack = null;

  return emitRadioEvent({
    type: "radio.scheduler_resumed",
    state: "ok",
    correlationId: meta.correlationId ?? newCorrelationId("resume"),
    parentEventId: meta.parentEventId ?? null,
    wasOverride,
    overrideTrack,
    memory: getMemoryContext(),
    learning: getLearningContext(),
    nextPreview: peekNextSong()
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
  radioState.overrideActive = false;
  radioState.lastOverrideTrack = null;
  return emitRadioEvent({
    type: "radio.queue_updated",
    correlationId: meta.correlationId ?? newCorrelationId("radio"),
    parentEventId: meta.parentEventId ?? null,
    queueSize: radioState.queue.length,
    memory: getMemoryContext(),
    learning: getLearningContext()
  });
}

export function updateRadioQueue(queue, meta = {}) {
  return setRadioQueue(queue, meta);
}

export async function scheduleNextRadioItem(meta = {}) {
  if (radioState.overrideActive) {
    resumeScheduler({ reason: "auto-resume-after-override" });
  }
  const nextTrack = await selectNextTrack();
  return setNowPlaying(nextTrack, meta);
}

export function subscribeRadio(listener) {
  radioListeners.add(listener);
  return () => radioListeners.delete(listener);
}

export function getRadioState() {
  return radioState;
}
