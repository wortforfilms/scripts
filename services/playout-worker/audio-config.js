const SAFE_TTS_MODES = new Set(["disabled", "google-translate"]);
const SAFE_TTS_LANGS = new Set(["en", "hi", "sa"]);

function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function getAudioRuntimeConfig() {
  const configuredMode = String(process.env.MAATAA_TTS_MODE ?? "disabled").toLowerCase();
  const ttsMode = SAFE_TTS_MODES.has(configuredMode) ? configuredMode : "disabled";

  return {
    ttsMode,
    ttsAudioEnabled: ttsMode !== "disabled",
    maxTtsChars: clampNumber(process.env.MAATAA_TTS_MAX_CHARS, 220, 40, 500),
    defaultTtsLang: SAFE_TTS_LANGS.has(String(process.env.MAATAA_TTS_LANG ?? "en").toLowerCase())
      ? String(process.env.MAATAA_TTS_LANG ?? "en").toLowerCase()
      : "en"
  };
}

export function buildSafeTtsAudioUrl(text, lang = "en") {
  const config = getAudioRuntimeConfig();
  if (!config.ttsAudioEnabled) return null;

  const safeText = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  if (!safeText) return null;

  const safeLang = SAFE_TTS_LANGS.has(String(lang ?? config.defaultTtsLang).toLowerCase())
    ? String(lang ?? config.defaultTtsLang).toLowerCase()
    : config.defaultTtsLang;

  const clippedText = safeText.slice(0, config.maxTtsChars);

  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${safeLang}&q=${encodeURIComponent(clippedText)}`;
}
