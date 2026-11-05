// Tests of the "Tempo de chat" hook. Run with: node --test hooks/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { LIMIT, STEP, contextTokens, decide, warningLevel } from "./aviso-tempo-de-chat.mjs";

const hook = fileURLToPath(new URL("./aviso-tempo-de-chat.mjs", import.meta.url));

const answer = (input, cacheRead, extra = {}) =>
  JSON.stringify({
    type: "assistant",
    message: { usage: { input_tokens: input, cache_creation_input_tokens: 0, cache_read_input_tokens: cacheRead } },
    ...extra,
  });

test("the context is the input of the last main-thread answer, cache included", () => {
  const jsonl = [answer(1, 1000), '{"type":"user"}', answer(2, 5000), answer(9, 9_000_000, { isSidechain: true }), "{cut"].join("\n");
  assert.equal(contextTokens(jsonl), 5002);
  assert.equal(contextTokens('{"type":"user"}\n'), null);
});

test("levels follow the configured limit and step", () => {
  assert.equal(warningLevel(LIMIT - 1), 0);
  assert.equal(warningLevel(LIMIT), 1);
  assert.equal(warningLevel(LIMIT + STEP - 1), 1);
  assert.equal(warningLevel(LIMIT + STEP), 2);
  assert.equal(warningLevel(150, 100, 25), 3);
});

test("warns once per level, and again after a compaction lowers the context", () => {
  assert.deepEqual(decide(LIMIT - 1, 0), { level: 0, warn: false });
  assert.deepEqual(decide(LIMIT, 0), { level: 1, warn: true });
  assert.deepEqual(decide(LIMIT + 10, 1), { level: 1, warn: false });
  assert.deepEqual(decide(LIMIT + STEP, 1), { level: 2, warn: true });
  assert.deepEqual(decide(50_000, 2), { level: 0, warn: false }); // compacted: remembers 0
  assert.deepEqual(decide(LIMIT, 0), { level: 1, warn: true });
});

test("as a hook: warns once above the limit, never blocks, silent on bad input", () => {
  const dir = mkdtempSync(join(tmpdir(), "tempo-de-chat-"));
  const transcript = join(dir, "t.jsonl");
  const session_id = `teste-${process.pid}-${Date.now()}`;
  const run = (input) => spawnSync(process.execPath, [hook], { input, encoding: "utf8" });
  const payload = JSON.stringify({ session_id, transcript_path: transcript });

  writeFileSync(transcript, answer(0, LIMIT - 1) + "\n");
  let result = run(payload);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");

  writeFileSync(transcript, answer(0, LIMIT) + "\n");
  result = run(payload);
  assert.equal(result.status, 0);
  assert.match(JSON.parse(result.stdout).hookSpecificOutput.additionalContext, /Tempo de chat/);
  assert.equal(run(payload).stdout, ""); // same level: no repeat

  assert.equal(run("não é json").status, 0);
  assert.equal(run(JSON.stringify({ session_id, transcript_path: join(dir, "nao-existe") })).status, 0);
});
