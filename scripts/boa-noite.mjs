// The end of the day: the fixed last line of the "pmp boa noite" and what happened after it.
// Usage:
//   node boa-noite.mjs depois [pasta das transcrições]   -> what was said after the last "boa noite"
// The folder defaults to the Claude Code transcripts of the current folder (~/.claude/projects/<pasta>).
// Used by the hansei (question 10) in the next "pmp bom dia". It only reads, and "nada" is a valid answer.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** The fixed last line of the "pmp boa noite". After it, nothing is asked, offered or done. */
export const LINHA_FINAL = "Boa noite encerrado. Retome com 'executar pmp bom dia'.";

/** The message that reopens the day after the "boa noite" (the only exception to the rule). */
export const REABRIR = /^\s*reabrir o dia\b/i;

/** True when the fixed line is the last non-empty line of a text. */
export function endsTheDay(text) {
  const lines = String(text ?? "").trimEnd().split("\n");
  return lines[lines.length - 1].trim() === LINHA_FINAL;
}

/** Text of a transcript entry from the main thread: the user's own words or the assistant's text. */
function textOf(entry) {
  if (entry.isSidechain || entry.isMeta) return null;
  const content = entry.message?.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;
  const parts = content.filter((c) => c.type === "text").map((c) => c.text);
  return parts.length ? parts.join("\n") : null;
}

/**
 * What was said after the last answer that ended the day, in a transcript (JSON lines).
 * Returns null when the day was never ended there; otherwise the list of { role, text } after it.
 * An answer that is only the fixed line is the expected reply and does not count.
 */
export function afterTheDay(jsonl) {
  const said = [];
  for (const line of jsonl.split("\n")) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== "user" && entry.type !== "assistant") continue;
    const text = textOf(entry);
    if (text !== null) said.push({ role: entry.type, text });
  }
  // The boa noite itself has a summary above the line; a reply that is only the line is not a new one.
  const last = said.findLastIndex((s) => s.role === "assistant" && endsTheDay(s.text) && s.text.trim() !== LINHA_FINAL);
  if (last < 0) return null;
  return said.slice(last + 1).filter((s) => !(s.role === "assistant" && s.text.trim() === LINHA_FINAL));
}

/** The transcripts folder Claude Code uses for a working folder (C:\a\b -> ~/.claude/projects/C--a-b). */
export const transcriptsDir = (cwd, home = homedir()) =>
  join(home, ".claude", "projects", cwd.replace(/[:\\/]/g, "-"));

/** Report for the hansei: the newest transcript that ended the day, and what came after it. */
export function report(dir) {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => join(dir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  for (const file of files) {
    const after = afterTheDay(readFileSync(file, "utf8"));
    if (after === null) continue;
    if (after.length === 0) return `${file}: nada depois do boa noite.`;
    const items = after.map((s) => `- ${s.role === "user" ? "usuário" : "Claude"}: ${s.text.replace(/\s+/g, " ").slice(0, 300)}`);
    return [`${file}: ${after.length} mensagens depois do boa noite:`, ...items].join("\n");
  }
  return `${dir}: nenhuma conversa terminou com o boa noite.`;
}

// Runs only as a command, so tests can import the rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir] = process.argv.slice(2);
  try {
    if (command !== "depois") throw new Error("Uso: boa-noite.mjs depois [pasta das transcrições]");
    console.log(report(dir ?? transcriptsDir(process.cwd())));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
