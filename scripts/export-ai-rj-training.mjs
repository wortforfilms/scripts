#!/usr/bin/env node
import { writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";

const API = process.env.MAATAA_API ?? "http://localhost:3000/api/ai-rj/training/export";
const OUT = resolve(process.cwd(), ".maataa-data/ai-rj-training.jsonl");

async function run() {
  const res = await fetch(API);
  if (!res.ok) {
    console.error("Export failed", res.status);
    process.exit(1);
  }

  const text = await res.text();

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, text, "utf8");

  console.log("✔ AI RJ training dataset exported:", OUT);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
