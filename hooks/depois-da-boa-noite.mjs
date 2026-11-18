// Hook of the end of the day, for two events (the "pmp boa noite" ends the conversation):
// - Stop: when the last answer ends with the fixed line of the "boa noite", remembers it for this
//   session (a mark in the temp folder).
// - UserPromptSubmit: on every message after that, writes the message to the pending file
//   (~/.claude/pendentes.md, read first by the next "pmp bom dia") and reminds Claude of the rule:
//   do nothing, ask nothing, answer only with the fixed line. "reabrir o dia" removes the mark.
// It only reminds, never blocks: it always exits 0 and stays silent on any error.
import { appendFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { LINHA_FINAL, REABRIR, endsTheDay } from "../scripts/boa-noite.mjs";

/** Where the mark of each ended session and the pending file live (the env overrides them, for tests). */
export function places(env = process.env) {
  return {
    marks: env.BOA_NOITE_ESTADO ?? join(tmpdir(), "depois-da-boa-noite"),
    pending: env.PENDENTES_ARQUIVO ?? join(homedir(), ".claude", "pendentes.md"),
  };
}

const HEADER = [
  "# Pendentes",
  "",
  'Gravado pelo "pmp boa noite" e pelo hook `depois-da-boa-noite` (minhas-skills). O "pmp bom dia" começa por aqui:',
  "cada item recebe a decisão do usuário e um destino (agora, backlog, registro do hansei, lição, recusado) e sai daqui.",
  "",
].join("\n");

/** Local date and time as dd/mm/aaaa hh:mm (never toISOString, which is UTC). */
const stamp = (d) => {
  const p = (v) => String(v).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** The line written to the pending file for a message that arrived after the "boa noite". */
export const pendingLine = (prompt, cwd, now = new Date()) =>
  `- ${stamp(now)} (${basename(cwd ?? "")}): mensagem depois do boa noite, sem resposta: ${String(prompt).replace(/\s+/g, " ").trim()}\n`;

/** The reminder given to Claude for a message after the "boa noite". */
export const REMINDER =
  `O "pmp boa noite" já encerrou esta conversa. O hook anotou esta mensagem em ~/.claude/pendentes.md, ` +
  `para o próximo "pmp bom dia". Não execute nada, não pergunte, não ofereça nem sugira nada: ` +
  `responda só com a linha "${LINHA_FINAL}". A única exceção é a mensagem "reabrir o dia".`;

export const REOPENED = 'Dia reaberto pelo usuário ("reabrir o dia"): a regra do boa noite deixou de valer nesta conversa.';

/**
 * Handles one hook event. Returns the context to give Claude, or null.
 * Effects go through `fs`, so tests can see them.
 */
export function handle(input, { marks, pending }, now = new Date()) {
  const session = String(input.session_id ?? "").replace(/[^\w-]/g, "_");
  if (!session) return null;
  const mark = join(marks, session);
  if (input.hook_event_name === "Stop") {
    if (endsTheDay(input.last_assistant_message)) {
      mkdirSync(marks, { recursive: true });
      writeFileSync(mark, stamp(now));
    }
    return null;
  }
  if (input.hook_event_name !== "UserPromptSubmit" || !existsSync(mark)) return null;
  if (REABRIR.test(input.prompt ?? "")) {
    rmSync(mark, { force: true });
    return REOPENED;
  }
  mkdirSync(dirname(pending), { recursive: true });
  if (!existsSync(pending)) writeFileSync(pending, HEADER);
  appendFileSync(pending, pendingLine(input.prompt ?? "", input.cwd, now));
  return REMINDER;
}

// Runs only as the hook, so tests can import the rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    const context = handle(input, places());
    if (context) {
      process.stdout.write(
        JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context } }),
      );
    }
  } catch {
    // a reminder must never get in the way: stay silent
  }
  process.exit(0);
}
