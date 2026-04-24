const SYSTEM_PROMPT = "You are Maataa RJ, a warm, wise, poetic, futuristic AI radio jockey. Speak with gentle Hinglish and optional Sanskrit transliteration. Keep announcements concise, musical, grounded, and broadcast-ready.";

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function payloadOf(event) {
  return event?.payload ?? event ?? {};
}

function buildFeedbackIndex(events) {
  const index = new Map();
  for (const event of events) {
    const payload = payloadOf(event);
    if (event.type !== "ai-rj.feedback" && payload.type !== "ai-rj.feedback") continue;
    const targetEventId = payload.targetEventId;
    if (!targetEventId) continue;
    const current = index.get(targetEventId) ?? { score: 0, ratings: [], notes: [] };
    const score = Number(payload.score ?? 0);
    current.score += Number.isFinite(score) ? score : 0;
    current.ratings.push(payload.rating ?? "unknown");
    if (payload.note) current.notes.push(String(payload.note));
    index.set(targetEventId, current);
  }
  return index;
}

function buildUserPrompt(payload) {
  const memory = payload.memory ?? {};
  const sessionContext = memory.sessionContext ?? {};
  const recentTitles = Array.isArray(memory.recentTitles) ? memory.recentTitles : [];
  const previewTrack = payload.previewTrack ?? {};
  const ghati = payload.hemantSamvatGhatiMap ?? {};

  return [
    `Mood: ${payload.mood ?? memory.listenerMood ?? "unknown"}`,
    `Reason: ${payload.reason ?? "unknown"}`,
    `Next track: ${previewTrack.title ?? "unknown"}`,
    `Recent tracks: ${recentTitles.join(", ") || "none"}`,
    `Session theme: ${sessionContext.theme ?? "unknown"}`,
    `Hemant Samvat day: ${ghati.hemantSamvatDay ?? "unknown"}`,
    `Ghati: ${ghati.ghati ?? "unknown"}`,
    `Pala: ${ghati.pala ?? "unknown"}`
  ].join("\n");
}

function toTrainingRecord(event, feedback = { score: 0 }) {
  const payload = payloadOf(event);
  const script = safeString(payload.ttsText);
  const feedbackScore = Number(feedback.score ?? 0);
  const reinforcementWeight = feedbackScore > 0 ? 1.25 : feedbackScore < 0 ? 0 : 1;

  return {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(payload) },
      { role: "assistant", content: script }
    ],
    metadata: {
      eventId: event.id ?? payload.id ?? null,
      time: event.time ?? payload.time ?? null,
      mood: payload.mood ?? payload.memory?.listenerMood ?? null,
      reason: payload.reason ?? null,
      provider: payload.scriptProvider ?? null,
      scheduledUnit: payload.memory?.lastPlayed?.scheduledUnit ?? payload.hemantSamvatGhatiMap?.scheduledUnits ?? null,
      track: payload.track ?? null,
      feedbackScore,
      reinforcementWeight,
      approved: feedbackScore >= 0,
      feedbackRatings: feedback.ratings ?? [],
      feedbackNotes: feedback.notes ?? []
    }
  };
}

export function buildAiRjTrainingDataset(events, options = {}) {
  const maxScriptLength = Number(options.maxScriptLength ?? 500);
  const minScriptLength = Number(options.minScriptLength ?? 12);
  const includeFallback = Boolean(options.includeFallback ?? false);
  const includeNegative = Boolean(options.includeNegative ?? false);
  const feedbackIndex = buildFeedbackIndex(events);
  const seen = new Set();
  const rejected = [];
  const records = [];
  const stats = {
    totalEvents: events.length,
    accepted: 0,
    rejected: 0,
    liked: 0,
    disliked: 0,
    neutral: 0,
    byMood: {},
    byReason: {},
    byProvider: {}
  };

  for (const event of events) {
    const payload = payloadOf(event);
    const script = safeString(payload.ttsText);
    const provider = payload.scriptProvider ?? "unknown";
    const eventId = event.id ?? payload.id ?? null;
    const feedback = feedbackIndex.get(eventId) ?? { score: 0, ratings: [], notes: [] };

    const reject = (reason) => {
      stats.rejected += 1;
      rejected.push({ id: eventId, reason });
    };

    if (payload.kind !== "ai-rj") {
      reject("not-ai-rj");
      continue;
    }
    if (!script || script.length < minScriptLength) {
      reject("script-too-short");
      continue;
    }
    if (script.length > maxScriptLength) {
      reject("script-too-long");
      continue;
    }
    if (!includeFallback && provider !== "http-llm") {
      reject("provider-not-http-llm");
      continue;
    }
    if (feedback.score < 0 && !includeNegative) {
      reject("negative-feedback");
      stats.disliked += 1;
      continue;
    }
    const key = script.toLowerCase();
    if (seen.has(key)) {
      reject("duplicate-script");
      continue;
    }
    seen.add(key);

    const record = toTrainingRecord(event, feedback);
    records.push(record);
    stats.accepted += 1;
    if (record.metadata.feedbackScore > 0) stats.liked += 1;
    else if (record.metadata.feedbackScore < 0) stats.disliked += 1;
    else stats.neutral += 1;
    stats.byMood[record.metadata.mood ?? "unknown"] = (stats.byMood[record.metadata.mood ?? "unknown"] ?? 0) + 1;
    stats.byReason[record.metadata.reason ?? "unknown"] = (stats.byReason[record.metadata.reason ?? "unknown"] ?? 0) + 1;
    stats.byProvider[record.metadata.provider ?? "unknown"] = (stats.byProvider[record.metadata.provider ?? "unknown"] ?? 0) + 1;
  }

  return {
    records,
    jsonl: records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""),
    stats,
    rejected
  };
}
