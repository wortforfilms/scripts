import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  isAdminAuthConfigured,
  requireAdminToken,
  resetRateLimitStateForTests
} from "../lib/api-security";
import { buildSafeTtsAudioUrl, getAudioRuntimeConfig } from "../../../services/playout-worker/audio-config.js";

describe("api security helpers", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    delete process.env.MAATAA_ADMIN_TOKEN;
    delete process.env.ADMIN_TOKEN;
    delete process.env.MAATAA_TTS_MODE;
    delete process.env.MAATAA_TTS_LANG;
    delete process.env.MAATAA_TTS_MAX_CHARS;
  });

  it("requires admin token on protected routes", async () => {
    process.env.MAATAA_ADMIN_TOKEN = "secret-token";

    const unauthorized = requireAdminToken(new Request("http://localhost/api/radio/next", { method: "POST" }));
    expect(unauthorized?.status).toBe(401);

    const authorized = requireAdminToken(
      new Request("http://localhost/api/radio/next", {
        method: "POST",
        headers: {
          "x-maataa-admin-token": "secret-token"
        }
      })
    );

    expect(authorized).toBeNull();
    expect(isAdminAuthConfigured()).toBe(true);
  });

  it("applies in-memory rate limits per client and route", () => {
    const request = new Request("http://localhost/api/runtime/events", {
      headers: {
        "x-forwarded-for": "203.0.113.10"
      }
    });

    const first = checkRateLimit(request, { key: "runtime-events", limit: 2, windowMs: 60_000 });
    const second = checkRateLimit(request, { key: "runtime-events", limit: 2, windowMs: 60_000 });
    const third = checkRateLimit(request, { key: "runtime-events", limit: 2, windowMs: 60_000 });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
    expect(third.response?.status).toBe(429);
  });
});

describe("audio runtime config", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("disables external TTS by default", () => {
    const config = getAudioRuntimeConfig();
    expect(config.ttsMode).toBe("disabled");
    expect(config.ttsAudioEnabled).toBe(false);
    expect(buildSafeTtsAudioUrl("hello world")).toBeNull();
  });

  it("generates bounded google-translate URLs when explicitly enabled", () => {
    process.env.MAATAA_TTS_MODE = "google-translate";
    process.env.MAATAA_TTS_LANG = "hi";
    process.env.MAATAA_TTS_MAX_CHARS = "12";

    const config = getAudioRuntimeConfig();
    const url = buildSafeTtsAudioUrl("Namaste Maataa radio", "hi");

    expect(config.ttsMode).toBe("google-translate");
    expect(config.ttsAudioEnabled).toBe(true);
    expect(url).toContain("translate.google.com");
    expect(url).toContain("tl=hi");
    expect(url).toContain(encodeURIComponent("Namaste Maat"));
  });
});
