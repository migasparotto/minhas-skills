import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { motivoParaPerguntar } from "./aviso-mcp-altera.mjs";

const pede = (tool_name, tool_input = {}) => motivoParaPerguntar({ tool_name, tool_input });

test("live: every tool that changes the open drawing asks", () => {
  for (const f of ["command_line", "script", "execute", "new_drawing", "open", "cancel"])
    assert.match(pede(`mcp__cadcraft-live__${f}`, { text: "line 0,0 1,1" }), /^⚠️ ALTERA:/, f);
});

test("live and headless: read-only tools pass", () => {
  for (const s of ["cadcraft", "cadcraft-live"])
    for (const f of ["inspect_drawing", "query_entities", "find_text", "list_commands", "render"])
      assert.equal(pede(`mcp__${s}__${f}`), null, `${s} ${f}`);
});

test("headless edits in memory pass; writing a file asks", () => {
  assert.equal(pede("mcp__cadcraft__command_line", { text: "line 0,0 1,1" }), null);
  assert.match(pede("mcp__cadcraft__save", { path: "C:\\x\\a.dxf" }), /grava o arquivo C:\\x\\a\.dxf/);
  assert.match(pede("mcp__cadcraft__render", { path: "a.png" }), /grava a imagem a\.png/);
});

test("other tools are ignored", () => {
  assert.equal(pede("Bash"), null);
  assert.equal(pede("mcp__cadcraftx__save"), null);
});

test("the real hook prints the ask decision, and nothing for a read", () => {
  const hook = fileURLToPath(new URL("./aviso-mcp-altera.mjs", import.meta.url));
  const run = (o) => execFileSync(process.execPath, [hook], { input: JSON.stringify(o) }).toString();
  const out = JSON.parse(run({ tool_name: "mcp__cadcraft-live__command_line", tool_input: { text: "u" } }));
  assert.equal(out.hookSpecificOutput.permissionDecision, "ask");
  assert.equal(run({ tool_name: "mcp__cadcraft-live__inspect_drawing", tool_input: {} }), "");
});
