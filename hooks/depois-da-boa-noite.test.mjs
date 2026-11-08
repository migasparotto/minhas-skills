// Tests of the end-of-day hook. Run with: node --test hooks/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { LINHA_FINAL } from "../scripts/boa-noite.mjs";
import { REMINDER, REOPENED, pendingLine } from "./depois-da-boa-noite.mjs";

const hook = fileURLToPath(new URL("./depois-da-boa-noite.mjs", import.meta.url));

/** Runs the real hook as a process, with its own temp mark folder and pending file. */
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "boa-noite-"));
  const env = { ...process.env, BOA_NOITE_ESTADO: join(dir, "marcas"), PENDENTES_ARQUIVO: join(dir, "pendentes.md") };
  const run = (input) => {
    const r = spawnSync(process.execPath, [hook], { input: JSON.stringify({ session_id: "s1", cwd: dir, ...input }), env, encoding: "utf8" });
    assert.equal(r.status, 0, "only reminds, never blocks");
    return r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.additionalContext : null;
  };
  return { run, pending: env.PENDENTES_ARQUIVO };
}

const endOfDay = `Resumo do dia...\n\nEm aberto: ...\n\n${LINHA_FINAL}\n`;

test("before the boa noite, messages pass untouched and nothing is written", () => {
  const { run, pending } = setup();
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "faz X" }), null);
  assert.equal(existsSync(pending), false);
});

test("an answer that only quotes the fixed line, without ending with it, does not end the day", () => {
  const { run, pending } = setup();
  run({ hook_event_name: "Stop", last_assistant_message: `A linha será "${LINHA_FINAL}". Posso seguir?` });
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "sim" }), null);
  assert.equal(existsSync(pending), false);
});

test("after the boa noite, every message is written to the pending file and gets the reminder", () => {
  const { run, pending } = setup();
  run({ hook_event_name: "Stop", last_assistant_message: endOfDay });
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "e o PR #50?" }), REMINDER);
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "faz o merge" }), REMINDER);
  const text = readFileSync(pending, "utf8");
  assert.match(text, /^# Pendentes/);
  assert.match(text, /sem resposta: e o PR #50\?\n/);
  assert.match(text, /sem resposta: faz o merge\n$/);
  assert.match(REMINDER, /Não execute nada, não pergunte/);
  assert.ok(REMINDER.includes(LINHA_FINAL));
});

test("another session is not affected by the boa noite of this one", () => {
  const { run } = setup();
  run({ hook_event_name: "Stop", last_assistant_message: endOfDay });
  assert.equal(run({ hook_event_name: "UserPromptSubmit", session_id: "s2", prompt: "oi" }), null);
});

test("'reabrir o dia' removes the rule, and the next messages pass again", () => {
  const { run, pending } = setup();
  run({ hook_event_name: "Stop", last_assistant_message: endOfDay });
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "Reabrir o dia" }), REOPENED);
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "faz X" }), null);
  assert.equal(existsSync(pending), false);
});

test("a malformed input stays silent", () => {
  const r = spawnSync(process.execPath, [hook], { input: "{cut", encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "");
});

test("the pending line uses the local time, also late at night", () => {
  const line = pendingLine("faz\nX", "C:/Projetos/tambor-de-notas", new Date(2026, 10, 7, 23, 30));
  assert.equal(line, "- 07/11/2026 23:30 (tambor-de-notas): mensagem depois do boa noite, sem resposta: faz X\n");
});
