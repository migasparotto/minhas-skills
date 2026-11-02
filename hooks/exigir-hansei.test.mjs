// Tests of the Stop hook rule. Run with: node --test hooks/exigir-hansei.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { hanseiMissing } from "./exigir-hansei.mjs";

const hook = fileURLToPath(new URL("./exigir-hansei.mjs", import.meta.url));

test("an answer without Kaizen lines ends freely, however long", () => {
  assert.equal(hanseiMissing({ last_assistant_message: "Feito." }), null);
  assert.equal(hanseiMissing({ last_assistant_message: "a".repeat(5000) }), null);
});

test("a final summary without a filled Hansei line is held", () => {
  assert.match(hanseiMissing({ last_assistant_message: "## 1\nKaizen: nenhum" }), /Hansei/);
  assert.match(hanseiMissing({ last_assistant_message: "Kaizen: nenhum\nHansei:" }), /Hansei/);
});

test("a final summary with a filled Hansei line ends", () => {
  const text = "Kaizen: nenhum\n**Hansei:** nada encontrado; conferido: CI";
  assert.equal(hanseiMissing({ last_assistant_message: text }), null);
});

test("never holds twice in a row, nor while background work is pending", () => {
  const text = "Kaizen: nenhum";
  assert.equal(hanseiMissing({ stop_hook_active: true, last_assistant_message: text }), null);
  assert.equal(hanseiMissing({ background_tasks: [{ id: "x" }], last_assistant_message: text }), null);
});

test("as a hook: exit 2 with the reason when held, 0 otherwise or on bad input", () => {
  const run = (input) => spawnSync(process.execPath, [hook], { input, encoding: "utf8" });
  const held = run(JSON.stringify({ last_assistant_message: "Kaizen: nenhum" }));
  assert.equal(held.status, 2);
  assert.match(held.stderr, /Hansei/);
  assert.equal(run(JSON.stringify({ last_assistant_message: "Feito." })).status, 0);
  assert.equal(run("não é json").status, 0);
});
