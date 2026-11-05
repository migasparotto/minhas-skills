import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { warning } from "./aviso-skills-fora-da-main.mjs";

test("no warning on main", () => {
  assert.equal(warning("main"), null);
});

test("warns on another branch, naming it and the worktree", () => {
  const text = warning("fix/prs-do-dia-fuso");
  assert.match(text, /fix\/prs-do-dia-fuso/);
  assert.match(text, /minhas-skills-dev/);
});

test("warns when the folder is not on a branch (detached)", () => {
  assert.match(warning(""), /fora de uma branch/);
});

test("as a command it always exits 0 and prints either nothing or one JSON message", () => {
  const hook = fileURLToPath(new URL("./aviso-skills-fora-da-main.mjs", import.meta.url));
  const run = spawnSync(process.execPath, [hook], { encoding: "utf8" });
  assert.equal(run.status, 0);
  if (run.stdout) assert.ok(typeof JSON.parse(run.stdout).systemMessage === "string");
});
