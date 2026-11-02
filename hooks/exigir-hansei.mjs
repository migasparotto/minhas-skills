// Stop hook: refuses to end a turn whose final summary has no filled "Hansei:" line.
// Claude Code passes the turn as JSON on stdin; exit 2 sends stderr back as the next instruction.
// Only a final summary is checked, and a final summary is the answer with "Kaizen:" lines (one per
// item, a rule of ~/.claude/CLAUDE.md). Never by length: a long explanation is not a summary.
import process from "node:process";

/** Decides whether the turn may end. Returns null to allow, or the reason to keep going. */
export function hanseiMissing({ stop_hook_active, last_assistant_message, background_tasks }) {
  const text = last_assistant_message ?? "";
  // Already continuing because of this hook, or paused waiting for background work: let it end.
  if (stop_hook_active || (background_tasks ?? []).length > 0) return null;
  if (!/^\W*Kaizen:/im.test(text)) return null;
  const filled = /^\W*Hansei:\**\s*\S{3,}/im.test(text);
  return filled
    ? null
    : 'O resumo final não tem a linha "Hansei:" preenchida. Chame o agente hansei (com o resumo, o diff e as afirmações feitas) e acrescente a linha "Hansei:" com o resultado antes de encerrar.';
}

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
let input = {};
try {
  input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
} catch {
  process.exit(0); // never block on a malformed input
}
const reason = hanseiMissing(input);
if (reason) {
  process.stderr.write(reason);
  process.exit(2);
}
