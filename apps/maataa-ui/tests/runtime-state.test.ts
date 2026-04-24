import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { pathToFileURL } from "url";

async function importFreshModule(relativePath: string) {
  vi.resetModules();
  const url = new URL(relativePath, import.meta.url);
  return import(`${pathToFileURL(url.pathname).href}?t=${Date.now()}`);
}

const tempDirs: string[] = [];

async function createRuntimeTempDir() {
  const dir = await mkdtemp(join(tmpdir(), "maataa-runtime-state-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  delete process.env.RUNTIME_STATE_FILE;
  delete process.env.RUNTIME_EVENTS_FILE;

  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

describe("runtime state persistence", () => {
  it("persists keyed runtime state into the shared JSON store", async () => {
    const dir = await createRuntimeTempDir();
    process.env.RUNTIME_STATE_FILE = join(dir, "runtime-state.json");

    const runtimeDb = await importFreshModule("../../../packages/runtime-db/index.js");

    await runtimeDb.persistRuntimeState("radio", { currentTrackId: "track-42", volume: 0.8 });

    await expect(
      runtimeDb.getRuntimeState("radio", { currentTrackId: null, volume: 0 })
    ).resolves.toEqual({
      currentTrackId: "track-42",
      volume: 0.8
    });

    await expect(runtimeDb.listRuntimeState()).resolves.toEqual({
      radio: { currentTrackId: "track-42", volume: 0.8 }
    });
  });

  it("hydrates radio engine state across module reloads", async () => {
    const dir = await createRuntimeTempDir();
    process.env.RUNTIME_STATE_FILE = join(dir, "runtime-state.json");
    process.env.RUNTIME_EVENTS_FILE = join(dir, "runtime-events.jsonl");

    const firstLoad = await importFreshModule("../../../services/playout-worker/index.js");
    await firstLoad.ensureRadioStateReady();
    await firstLoad.setRadioQueue([
      {
        id: "persisted-song",
        title: "Persistent Song",
        kind: "song",
        audioUrl: "https://example.com/persistent-song.mp3",
        durationSec: 180
      }
    ]);
    await firstLoad.scheduleNextRadioItem();

    const firstState = firstLoad.getRadioState();
    expect(firstState.currentTrack?.title).toBe("Persistent Song");
    expect(firstState.logs[0]?.type).toBe("radio.now_playing");

    const secondLoad = await importFreshModule("../../../services/playout-worker/index.js");
    await secondLoad.ensureRadioStateReady();

    const hydratedState = secondLoad.getRadioState();
    expect(hydratedState.currentTrack?.title).toBe("Persistent Song");
    expect(hydratedState.queue).toHaveLength(1);
    expect(hydratedState.queue[0]?.id).toBe("persisted-song");
    expect(hydratedState.logs[0]?.type).toBe("radio.now_playing");
  });
});
