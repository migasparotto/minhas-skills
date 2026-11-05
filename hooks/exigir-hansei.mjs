// Stop hook: refuses to end a turn whose final summary has no filled "Hansei:" line.
// Claude Code passes the turn as JSON on stdin; exit 2 sends stderr back as the next instruction.
// Only a final summary is checked, and a final summary is the answer with "Kaizen:" lines (one per
// item, a rule of ~/.claude/CLAUDE.md). Never by length: a long explanation is not a summary.
// It also holds a final summary that leaves out a finding still "aberto" in docs/hansei.md.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { openIds, parse } from "../scripts/hansei-registro.mjs";

/** Decides whether the turn may end. Returns null to allow, or the reason to keep going. */
export function hanseiMissing({ stop_hook_active, last_assistant_message, background_tasks }) {
  const text = last_assistant_message ?? "";
  // Already continuing because of this hook, or paused waiting for background work: let it end.
  if (stop_hook_active || (background_tasks ?? []).length > 0) return null;
  if (!/^\W*Kaizen:/im.test(text)) return null;
  // Filled = at least 3 characters on the same line ("6 achados" counts; an empty line does not).
  const filled = /^\W*Hansei:\**[ \t]*\S[^\n]{2,}/im.test(text);
  return filled
    ? null
    : 'O resumo final não tem a linha "Hansei:" preenchida. Chame o agente hansei (com o resumo, o diff e as afirmações feitas) e acrescente a linha "Hansei:" com o resultado antes de encerrar.';
}

/**
 * A final summary must cite every finding still "aberto" in the project's hansei registry
 * (docs/hansei.md), so no finding is dropped without reaching the user. Returns null or the reason.
 */
export function openFindingsMissing({ stop_hook_active, last_assistant_message, background_tasks }, open) {
  const text = last_assistant_message ?? "";
  if (stop_hook_active || (background_tasks ?? []).length > 0) return null;
  if (!/^\W*Kaizen:/im.test(text)) return null;
  // Whole IDs only: citing 2026-11-05-12 must not count as citing 2026-11-05-1.
  const missing = open.filter((id) => !new RegExp(`(?<![\\d-])${id}(?!\\d)`).test(text));
  return missing.length === 0
    ? null
    : `O resumo final não cita os achados do hansei ainda abertos em docs/hansei.md: ${missing.join(", ")}. Mostre cada um ao usuário (achado e ID) para ele decidir; nenhum achado é recusado por conta própria.`;
}

// Reads the turn only when run as the hook, so tests can import the rule.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input = {};
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    process.exit(0); // never block on a malformed input
  }
  let open = [];
  try {
    open = openIds(parse(readFileSync(join(input.cwd ?? process.cwd(), "docs", "hansei.md"), "utf8")));
  } catch {
    // no registry in this project
  }
  const reason = hanseiMissing(input) ?? openFindingsMissing(input, open);
  if (reason) {
    process.stderr.write(reason);
    process.exit(2);
  }
}
