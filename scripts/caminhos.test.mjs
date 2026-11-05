import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findInRepository, findProblems } from "./caminhos.mjs";

const B = String.fromCharCode(92); // a backslash, built so this file does not break its own rules

test("paths: finds a broken path, where the backslash after C: was lost", () => {
  assert.equal(findProblems("worktree em C:Projetosminhas-skills").length, 1);
});

test("paths: finds personal paths in the three spellings", () => {
  for (const path of [`C:${B}Users${B}fulano`, "C:/Users/fulano", "/c/Users/fulano"]) {
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
