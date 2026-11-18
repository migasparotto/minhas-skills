// Tests of the Stop hook rule. Run with: node --test hooks/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { hanseiMissing, openFindingsMissing, openIdsOf, registryFiles } from "./exigir-hansei.mjs";

const hook = fileURLToPath(new URL("./exigir-hansei.mjs", import.meta.url));
const REGISTRY_HEAD = "| ID | Data | Achado | Status | Decisão |\n| --- | --- | --- | --- | --- |\n";
// Runs the real hook; by default with an empty system registry, so the repo's own findings never leak in.
const runHook = (input, sistema = join(tmpdir(), "sem-registro-sistema.md")) =>
  spawnSync(process.execPath, [hook], {
    input,
    encoding: "utf8",
    env: { ...process.env, HANSEI_REGISTRO_SISTEMA: sistema },
  });

test("registries: the project's and the system's, the system one next to this hook", () => {
  const [project, system] = registryFiles("C:/proj", {});
  assert.equal(project, join("C:/proj", "docs", "hansei.md"));
  assert.equal(system, fileURLToPath(new URL("../docs/hansei.md", import.meta.url)));
  assert.equal(registryFiles("C:/proj", { HANSEI_REGISTRO_SISTEMA: "x.md" })[1], "x.md");
});

test("registries: open IDs of both, once each; a missing file has none", () => {
  const files = {
    a: `${REGISTRY_HEAD}| 2026-11-07-1 | 07/11/2026 | X | aberto |  |\n| 2026-11-07-2 | 07/11/2026 | Y | feito |  |\n`,
    b: `${REGISTRY_HEAD}| 2026-11-07-1 | 07/11/2026 | X | aberto |  |\n| 2026-11-07-3 | 07/11/2026 | Z | aberto |  |\n`,
  };
  const read = (f) => {
    if (!(f in files)) throw new Error("ENOENT");
    return files[f];
  };
  assert.deepEqual(openIdsOf(["a", "b", "falta"], read), ["2026-11-07-1", "2026-11-07-3"]);
});

test("as a hook: holds a summary that leaves out an open finding of the system registry", () => {
  const dir = mkdtempSync(join(tmpdir(), "sistema-"));
  const sistema = join(dir, "hansei.md");
  writeFileSync(sistema, `${REGISTRY_HEAD}| 2026-11-07-9 | 07/11/2026 | S | aberto |  |\n`);
  const input = (message) => JSON.stringify({ cwd: dir, last_assistant_message: message });
  const held = runHook(input("Kaizen: nenhum\nHansei: nada encontrado; conferido: CI"), sistema);
  assert.equal(held.status, 2);
  assert.match(held.stderr, /2026-11-07-9/);
  assert.equal(runHook(input("Kaizen: nenhum\nHansei: 1 achado (2026-11-07-9)"), sistema).status, 0);
});

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
  const run = (input) => runHook(input);
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
  const run = (message) => runHook(JSON.stringify({ cwd, last_assistant_message: message }));
  const held = run("Kaizen: nenhum\nHansei: nada encontrado; conferido: CI");
  assert.equal(held.status, 2);
  assert.match(held.stderr, /2026-11-05-1/);
  assert.equal(run("Kaizen: nenhum\nHansei: 1 achado (2026-11-05-1)").status, 0);
});

test("citing a longer ID does not count as citing a shorter one", () => {
  const summary = { last_assistant_message: "Kaizen: nenhum\nHansei: 1 achado (2026-11-05-12)" };
  assert.match(openFindingsMissing(summary, ["2026-11-05-1"]), /2026-11-05-1/);
  assert.equal(openFindingsMissing(summary, ["2026-11-05-12"]), null);
});

// Regression cases: every real "Hansei:" line the hook got wrong is kept in casos-reais-hansei.json.
test("real Hansei lines: each known case is judged right", () => {
  const cases = JSON.parse(readFileSync(new URL("./casos-reais-hansei.json", import.meta.url), "utf8"));
  for (const { linha, aceita, origem } of cases) {
    const verdict = hanseiMissing({ last_assistant_message: `Kaizen: nenhum\n${linha}` });
    assert.equal(verdict === null, aceita, `${linha} (${origem})`);
  }
});

// The hook and the agent must agree on the format: the line the agent is told to write is accepted.
test("the format line of agents/hansei.md, filled in, is accepted", () => {
  const agent = readFileSync(new URL("../agents/hansei.md", import.meta.url), "utf8");
  const format = agent.match(/^`(Hansei:[^`]+)`$/m)?.[1];
  assert.ok(format, "agents/hansei.md não tem mais a linha de formato `Hansei: ...`");
  for (const option of format.split(" | ")) {
    const filled = (option.startsWith("Hansei:") ? option : `Hansei: ${option}`)
      .replace("<N>", "3")
      .replace(/<[^>]+>/g, "exemplo");
    assert.equal(hanseiMissing({ last_assistant_message: `Kaizen: nenhum\n${filled}` }), null, filled);
  }
});
