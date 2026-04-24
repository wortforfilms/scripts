import type { ScriptRecord } from "./script-data";

export const scriptFontMap: Record<string, string> = {
  aramaic: '"Noto Sans Imperial Aramaic", "Noto Sans", sans-serif',
  devanagari: '"Noto Sans Devanagari", "Noto Sans", sans-serif',
  hebrew: '"Noto Sans Hebrew", "Noto Sans", sans-serif',
  latin: '"Noto Sans", system-ui, sans-serif',
  tamil: '"Noto Sans Tamil", "Noto Sans", sans-serif'
};

export function fontForScript(script: Pick<ScriptRecord, "slug">) {
  return scriptFontMap[script.slug] ?? '"Noto Sans", system-ui, sans-serif';
}
