import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findInRepository, findProblems } from "./caminhos.mjs";

// Built in parts, so this file (scanned by its own test) does not break the rules it checks.
const B = String.fromCharCode(92); // a backslash
const U = "Users";
const C = "C:";

test("paths: finds a broken path, where the backslash after C: was lost", () => {
  assert.equal(findProblems(`worktree em ${C}Projetosminhas-skills`).length, 1);
});

test("paths: finds personal paths in the three spellings", () => {
  for (const path of [`${C}${B}${U}${B}fulano`, `${C}/${U}/fulano`, `/c/${U}/fulano`]) {
    assert.equal(findProblems(`em ${path}${B}notas`).length, 1);
  }
});

test("paths: accepts relative paths, ~, other folders and text that only looks similar", () => {
  for (const line of ["~/.claude/skills", `C:${B}Projetos${B}minhas-skills`, "C:/Dados/a.md", "%USERPROFILE%", 'x("a<b>c:d")']) {
    assert.deepEqual(findProblems(line), []);
  }
});

test("paths: the repository has no broken or personal path in its versioned files", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  assert.deepEqual(findInRepository(root), []);
});
