// UserPromptSubmit hook: when the session context passes a limit, asks Claude to end the answer with
// the "Tempo de chat" warning (a rule of ~/.claude/CLAUDE.md). It is only a warning, never a block:
// it always exits 0, and stays silent on any error.
// It warns once at LIMIT and again every STEP tokens above it, remembering per session (temp folder).
import { mkdirSync, openSync, readFileSync, readSync, closeSync, fstatSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** First warning, in tokens. Auto-compact is at 400k, so this leaves room for the "pmp boa noite". */
export const LIMIT = 300_000;
/** A new warning every STEP tokens above LIMIT (350k, 400k...). */
export const STEP = 50_000;
/** Only the end of the transcript is read: the last answer with token usage is there. */
const TAIL_BYTES = 4 * 1024 * 1024;

/** Context size of the last main-thread answer in a transcript (JSON lines), or null if none. */
export function contextTokens(jsonl) {
  const lines = jsonl.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch {
      continue; // the first line of a tail read is usually cut
    }
    const usage = entry?.message?.usage;
    if (entry?.type !== "assistant" || entry.isSidechain || !usage) continue;
    return (
      (usage.input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0)
    );
  }
  return null;
}

/** Warning level for a context size: 0 below LIMIT, 1 at LIMIT, 2 at LIMIT + STEP, and so on. */
export function warningLevel(tokens, limit = LIMIT, step = STEP) {
  return tokens < limit ? 0 : Math.floor((tokens - limit) / step) + 1;
}

/** Decides whether to warn now. Returns the level to remember and whether to warn. */
export function decide(tokens, savedLevel, limit = LIMIT, step = STEP) {
  const level = warningLevel(tokens, limit, step);
  // After a compaction the context shrinks: remember the lower level, so it can warn again later.
  return { level, warn: level > savedLevel };
}

/** The instruction given to Claude when it is time to warn. */
export function warningText(tokens) {
  const k = Math.round(tokens / 1000);
  return (
    `Aviso de tempo de chat: o contexto desta sessão está em cerca de ${k} mil tokens ` +
    `(a compactação automática é em 400 mil). Termine a resposta com o aviso "⏰ Tempo de chat" ` +
    `da regra do ~/.claude/CLAUDE.md, com o próximo assunto preenchido. É só um aviso: ` +
    `não pare o trabalho por causa dele; a decisão de encerrar é do usuário.`
  );
}

function readTail(path) {
  const fd = openSync(path, "r");
  try {
    const size = fstatSync(fd).size;
    const length = Math.min(size, TAIL_BYTES);
    const buffer = Buffer.alloc(length);
    readSync(fd, buffer, 0, length, size - length);
    return buffer.toString("utf8");
  } finally {
    closeSync(fd);
  }
}

// Runs only as the hook, so tests can import the rules.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const { session_id, transcript_path } = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const tokens = contextTokens(readTail(transcript_path));
    if (tokens !== null && session_id) {
      const dir = join(tmpdir(), "aviso-tempo-de-chat");
      const stateFile = join(dir, `${String(session_id).replace(/[^\w-]/g, "_")}.json`);
      let saved = 0;
      try {
        saved = JSON.parse(readFileSync(stateFile, "utf8")).level ?? 0;
      } catch {
        // first time in this session
      }
      const { level, warn } = decide(tokens, saved);
      if (level !== saved) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(stateFile, JSON.stringify({ level }));
      }
      if (warn) {
        process.stdout.write(
          JSON.stringify({
            hookSpecificOutput: {
              hookEventName: "UserPromptSubmit",
              additionalContext: warningText(tokens),
            },
          }),
        );
      }
    }
  } catch {
    // a warning must never get in the way: stay silent
  }
  process.exit(0);
}
