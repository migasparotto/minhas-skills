// Tests of the scripts. Run with: node --test scripts/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { add, openIds, parse, render, setStatus } from "./hansei-registro.mjs";
import { format, ghArgs, today } from "./prs-do-dia.mjs";

const day = new Date("2026-11-05T12:00:00Z");

test("registry: new findings are open, numbered per day, and survive a round trip", () => {
  let { rows, id } = add([], "Texto | com barra\ne quebra", day);
  assert.equal(id, "2026-11-05-1");
  ({ rows, id } = add(rows, "Outro", day));
  assert.equal(id, "2026-11-05-2");
  const back = parse(render(rows));
  assert.equal(back.length, 2);
  assert.equal(back[0].date, "05/11/2026");
  assert.equal(back[0].status, "aberto");
  assert.match(back[0].finding, /com barra/);
  assert.deepEqual(openIds(back), ["2026-11-05-1", "2026-11-05-2"]);
});

test("registry: only valid statuses; refusing needs the user's reason", () => {
  const { rows } = add([], "Achado", day);
  assert.throws(() => setStatus(rows, "2026-11-05-1", "talvez"), /inválido/);
  assert.throws(() => setStatus(rows, "2026-11-05-1", "aberto"), /inválido/);
  assert.throws(() => setStatus(rows, "2026-11-05-1", "recusado"), /motivo/);
  assert.throws(() => setStatus(rows, "2026-11-05-9", "aceito"), /não encontrado/);
  const refused = setStatus(rows, "2026-11-05-1", "recusado", "não vale o custo");
  assert.equal(refused[0].status, "recusado pelo usuário");
  assert.equal(refused[0].decision, "não vale o custo");
  assert.deepEqual(openIds(setStatus(rows, "2026-11-05-1", "feito")), []);
  assert.throws(() => add([], "  "), /vazio/);
});

test("registry as a command: add, list open, change status", () => {
  const file = join(mkdtempSync(join(tmpdir(), "hansei-")), "docs", "hansei.md");
  const script = fileURLToPath(new URL("./hansei-registro.mjs", import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  const id = run("add", file, "Um achado").stdout.trim();
  assert.match(id, /^\d{4}-\d{2}-\d{2}-1$/);
  assert.equal(run("abertos", file).stdout.trim(), id);
  assert.equal(run("status", file, id, "recusado").status, 1);
  assert.equal(run("status", file, id, "aceito").status, 0);
  assert.equal(run("abertos", file).stdout.trim(), "");
  assert.match(readFileSync(file, "utf8"), /\| aceito \|/);
});

test("PRs of the day: search by merge date into main, oldest first", () => {
  const args = ghArgs("2026-11-05", "dono/repo");
  assert.ok(args.includes("merged:2026-11-05"));
  assert.deepEqual(args.slice(-2), ["--repo", "dono/repo"]);
  assert.ok(!ghArgs("2026-11-05", null).includes("--repo"));
  const prs = [
    { number: 2, title: "B", mergedAt: "2026-11-05T15:00:00Z", url: "u2" },
    { number: 1, title: "A", mergedAt: "2026-11-05T10:00:00Z", url: "u1" },
  ];
  assert.deepEqual(format("dono/repo", prs), ["dono/repo#1 A (u1)", "dono/repo#2 B (u2)"]);
  assert.deepEqual(format("dono/repo", []), ["dono/repo: nenhum PR entrou na main."]);
  assert.equal(today(new Date(2026, 10, 5, 23, 30)), "2026-11-05");
});

test("registry: the ID uses the local day, also late at night", () => {
  const late = new Date(2026, 10, 5, 23, 30); // 05/11 23:30 local time
  const { id, rows } = add([], "Achado", late);
  assert.equal(id, "2026-11-05-1");
  assert.equal(rows[0].date, "05/11/2026");
});
