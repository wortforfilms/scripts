#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { spawn } from "child_process";

const ROOT = process.cwd();
const DATASET = resolve(ROOT, ".maataa-data/ai-rj-training.jsonl");
const MANIFEST = resolve(ROOT, ".maataa-data/ai-rj-training-manifest.json");
const EXPORT_API = process.env.MAATAA_AI_RJ_EXPORT_API ?? "http://localhost:3000/api/ai-rj/training/export";
const RETRAIN_CMD = process.env.AI_RJ_RETRAIN_CMD ?? "";
const DEPLOY_CMD = process.env.AI_RJ_DEPLOY_CMD ?? "";
const MIN_ROWS = Number(process.env.AI_RJ_MIN_TRAINING_ROWS ?? "25");

function runCommand(command, label) {
  if (!command) return Promise.resolve({ skipped: true });
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, { shell: true, stdio: "inherit", env: process.env });
    child.on("exit", (code) => {
      if (code === 0) resolveRun({ skipped: false, code });
      else rejectRun(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    return { runs: [] };
  }
}

async function writeManifest(manifest) {
  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
}

function countJsonlRows(text) {
  return text.split("\n").filter(Boolean).length;
}

async function exportDataset() {
  const response = await fetch(EXPORT_API);
  if (!response.ok) throw new Error(`Export failed: ${response.status}`);
  const text = await response.text();
  await mkdir(dirname(DATASET), { recursive: true });
  await writeFile(DATASET, text, "utf8");
  return { text, rows: countJsonlRows(text) };
}

async function main() {
  const startedAt = new Date().toISOString();
  const manifest = await readManifest();
  const exportResult = await exportDataset();

  const run = {
    startedAt,
    finishedAt: null,
    dataset: DATASET,
    rows: exportResult.rows,
    retrain: null,
    deploy: null,
    status: "exported"
  };

  if (exportResult.rows < MIN_ROWS) {
    run.status = "skipped-low-row-count";
    run.reason = `Need at least ${MIN_ROWS} rows, got ${exportResult.rows}`;
    run.finishedAt = new Date().toISOString();
    manifest.runs = [run, ...(manifest.runs ?? [])].slice(0, 50);
    await writeManifest(manifest);
    console.log(`⚠ ${run.reason}`);
    return;
  }

  run.retrain = await runCommand(RETRAIN_CMD, "retrain");
  run.deploy = await runCommand(DEPLOY_CMD, "deploy");
  run.status = "completed";
  run.finishedAt = new Date().toISOString();

  manifest.runs = [run, ...(manifest.runs ?? [])].slice(0, 50);
  await writeManifest(manifest);
  console.log("✔ Continuous AI RJ training loop completed", run);
}

main().catch(async (error) => {
  const manifest = await readManifest();
  const run = {
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    status: "failed",
    error: error.message
  };
  manifest.runs = [run, ...(manifest.runs ?? [])].slice(0, 50);
  await writeManifest(manifest);
  console.error(error);
  process.exit(1);
});
