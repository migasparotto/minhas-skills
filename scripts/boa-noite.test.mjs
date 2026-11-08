// Tests of the end of the day: the text of the "pmp boa noite" and "pmp bom dia" skills, and what
// was said after the "boa noite". Run with: node --test scripts/*.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { LINHA_FINAL, afterTheDay, endsTheDay, transcriptsDir } from "./boa-noite.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const boaNoite = read("../pmp-boa-noite/SKILL.md");
const bomDia = read("../pmp-bom-dia/SKILL.md");

// Pedido do usuário de 08/11/2026: o boa noite encerra a conversa, sem pergunta e com a linha fixa.
test("the boa noite text never lets it end with a question", () => {
  const asks = /com aprovação|precisa de aprovação|esperar o OK|pedir o OK|Responda \*\*"ok|perguntar ao usuário|quer que eu/i;
  assert.doesNotMatch(boaNoite, asks);
  assert.match(boaNoite, /\*\*nenhuma pergunta\*\*/i);
  assert.match(boaNoite, /Nada depois dela/);
  // The last step is the fixed line, alone on its own line.
  const steps = boaNoite.split("## Passos")[1].split("\n## ")[0];
  const last = steps.split(/\n\d+\. /).at(-1);
  assert.match(last, /^\*\*Última linha\*\*/);
  assert.ok(last.split("\n").some((l) => l.trim() === LINHA_FINAL), "the fixed line, alone");
  assert.match(boaNoite, /"reabrir o dia"/);
});

test("the bom dia starts with the pending decisions of the night", () => {
  const first = bomDia.split("## Passos")[1].split(/\n\d+\. /)[1];
  assert.match(first, /~\/\.claude\/pendentes\.md/);
  assert.match(first, /decisão/);
  assert.match(bomDia, /pergunta 10/);
});

test("the guardar-licao skill does not ask for the OK inside the boa noite", () => {
  const skill = read("../guardar-licao/SKILL.md");
  const line = skill.split("\n").find((l) => l.startsWith('- "pmp boa noite"'));
  assert.match(line, /~\/\.claude\/pendentes\.md/);
});

test("the hansei agent has the question about the conversation after the boa noite", () => {
  const agent = read("../agents/hansei.md");
  assert.match(agent, /10\. \*\*Depois do boa noite/);
  assert.match(agent, /boa-noite\.mjs depois/);
});

test("only an answer whose last line is the fixed line ends the day", () => {
  assert.ok(endsTheDay(`Resumo\n\n${LINHA_FINAL}\n\n`));
  assert.ok(!endsTheDay(`${LINHA_FINAL}\nQuer que eu faça o merge?`));
  assert.ok(!endsTheDay(`A linha será "${LINHA_FINAL}"`));
  assert.ok(!endsTheDay(undefined));
});

const entry = (type, content, extra = {}) => JSON.stringify({ type, message: { content }, ...extra });
const text = (t) => [{ type: "text", text: t }];

test("what was said after the boa noite: the fixed line as a reply does not count", () => {
  const jsonl = [
    entry("user", "executar pmp boa noite"),
    entry("assistant", text(`Resumo\n${LINHA_FINAL}`)),
    entry("user", "e o PR?"),
    entry("assistant", text(LINHA_FINAL)),
    entry("user", [{ type: "tool_result", content: "x" }]),
    entry("assistant", text("sub"), { isSidechain: true }),
    "{cut",
  ].join("\n");
  assert.deepEqual(afterTheDay(jsonl), [{ role: "user", text: "e o PR?" }]);
});

test("what was said after the boa noite: an answer that kept working is found", () => {
  const jsonl = [
    entry("assistant", text(`Resumo\n${LINHA_FINAL}`)),
    entry("user", "faz o merge"),
    entry("assistant", text("Fiz o merge do PR #50. Quer que eu abra o próximo?")),
  ].join("\n");
  assert.equal(afterTheDay(jsonl).length, 2);
  assert.equal(afterTheDay(entry("assistant", text("Sem boa noite aqui."))), null);
});

test("the transcripts folder follows the Claude Code name for the working folder", () => {
  assert.equal(transcriptsDir("C:\\Projetos\\tambor-de-notas", "H"), join("H", ".claude", "projects", "C--Projetos-tambor-de-notas"));
});

test("as a command: reports the newest conversation that ended the day, and 'nothing' is an answer", () => {
  const dir = mkdtempSync(join(tmpdir(), "transcricoes-"));
  const script = fileURLToPath(new URL("./boa-noite.mjs", import.meta.url));
  const run = () => spawnSync(process.execPath, [script, "depois", dir], { encoding: "utf8" });
  assert.match(run().stdout, /nenhuma conversa terminou com o boa noite/);
  writeFileSync(join(dir, "velha.jsonl"), [entry("assistant", text(`Resumo\n${LINHA_FINAL}`)), entry("user", "oi")].join("\n"));
  utimesSync(join(dir, "velha.jsonl"), new Date(2026, 10, 1), new Date(2026, 10, 1));
  writeFileSync(join(dir, "nova.jsonl"), entry("assistant", text(`Resumo\n${LINHA_FINAL}`)));
  const out = run();
  assert.equal(out.status, 0);
  assert.match(out.stdout, /nova\.jsonl: nada depois do boa noite/);
});
