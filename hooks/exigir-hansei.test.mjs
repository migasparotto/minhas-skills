// Tests of the Stop hook rule. Run with: node --test hooks/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { hanseiMissing, openFindingsMissing } from "./exigir-hansei.mjs";

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
  // The agent's own format starts with a number: "Hansei: 6 achados (...)".
  assert.equal(hanseiMissing({ last_assistant_message: "Kaizen: x\nHansei: 6 achados (1, 2)" }), null);
  assert.match(hanseiMissing({ last_assistant_message: "Kaizen: x\nHansei:\nOutra linha" }), /Hansei/);
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

test("a final summary must cite every open finding of the registry", () => {
  const summary = { last_assistant_message: "Kaizen: nenhum\nHansei: 1 achado (2026-11-05-1)" };
  assert.equal(openFindingsMissing(summary, ["2026-11-05-1"]), null);
  assert.match(openFindingsMissing(summary, ["2026-11-05-1", "2026-11-05-2"]), /2026-11-05-2/);
  assert.equal(openFindingsMissing({ last_assistant_message: "Feito." }, ["2026-11-05-2"]), null);
});

test("as a hook: holds a summary that leaves out an open finding of docs/hansei.md", () => {
  const cwd = mkdtempSync(join(tmpdir(), "registro-"));
  mkdirSync(join(cwd, "docs"));
  writeFileSync(
    join(cwd, "docs", "hansei.md"),
    "| ID | Data | Achado | Status | Decisão |\n| --- | --- | --- | --- | --- |\n| 2026-11-05-1 | 05/11/2026 | X | aberto |  |\n",
  );
  const run = (message) =>
    spawnSync(process.execPath, [hook], {
      input: JSON.stringify({ cwd, last_assistant_message: message }),
      encoding: "utf8",
    });
  const held = run("Kaizen: nenhum\nHansei: nada encontrado; conferido: CI");
  assert.equal(held.status, 2);
  assert.match(held.stderr, /2026-11-05-1/);
  assert.equal(run("Kaizen: nenhum\nHansei: 1 achado (2026-11-05-1)").status, 0);
});
