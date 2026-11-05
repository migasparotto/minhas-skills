// Registry of hansei findings: one table per project (docs/hansei.md), one row per finding.
// Usage:
//   node hansei-registro.mjs add <arquivo> "<achado>"                 -> prints the new ID (status "aberto")
//   node hansei-registro.mjs status <arquivo> <ID> aceito|feito
//   node hansei-registro.mjs status <arquivo> <ID> recusado "<motivo do usuário>"
//   node hansei-registro.mjs abertos <arquivo>                        -> prints the open IDs
// Only these statuses exist; "recusado" means refused by the user, and always carries the reason.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const STATUSES = ["aberto", "aceito", "feito", "recusado pelo usuário"];
const HEADER = [
  "# Registro do hansei",
  "",
  "Cada achado do agente `hansei`, com o status. Gravado por `hansei-registro.mjs` (minhas-skills).",
  "Um achado só sai de `aberto` pela decisão do usuário; `recusado pelo usuário` traz o motivo dele.",
  "",
  "| ID | Data | Achado | Status | Decisão |",
  "| --- | --- | --- | --- | --- |",
];

const cell = (text) => String(text).replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();

/** Reads the rows of a registry text. */
export function parse(text) {
  return text
    .split("\n")
    .filter((line) => /^\| \d{4}-\d{2}-\d{2}-\d+ \|/.test(line))
    .map((line) => {
      const [id, date, finding, status, decision] = line
        .slice(2, -2)
        .split(/ (?<!\\)\| /)
        .map((c) => c.trim());
      return { id, date, finding, status, decision: decision ?? "" };
    });
}

/** Writes the full registry text for some rows. */
export function render(rows) {
  const body = rows.map(
    (r) => `| ${r.id} | ${r.date} | ${cell(r.finding)} | ${r.status} | ${cell(r.decision)} |`,
  );
  return [...HEADER, ...body, ""].join("\n");
}

/** Adds an open finding dated `now`. Returns the new rows and the new ID (date-sequence). */
export function add(rows, finding, now = new Date()) {
  if (!finding?.trim()) throw new Error("O achado está vazio.");
  const iso = now.toISOString().slice(0, 10);
  const n = rows.filter((r) => r.id.startsWith(`${iso}-`)).length + 1;
  const id = `${iso}-${n}`;
  const date = iso.split("-").reverse().join("/");
  return { rows: [...rows, { id, date, finding, status: "aberto", decision: "" }], id };
}

/** Changes the status of a finding. "recusado" requires the user's reason. */
export function setStatus(rows, id, status, reason = "") {
  const target = status === "recusado" ? "recusado pelo usuário" : status;
  if (!STATUSES.includes(target) || target === "aberto") {
    throw new Error(`Status inválido: ${status}. Use aceito, feito ou recusado.`);
  }
  if (target === "recusado pelo usuário" && !reason.trim()) {
    throw new Error("Recusar exige o motivo dado pelo usuário.");
  }
  if (!rows.some((r) => r.id === id)) throw new Error(`Achado não encontrado: ${id}`);
  return rows.map((r) => (r.id === id ? { ...r, status: target, decision: reason || r.decision } : r));
}

/** IDs of the findings still open. */
export const openIds = (rows) => rows.filter((r) => r.status === "aberto").map((r) => r.id);

// Runs only as a command, so tests can import the rules.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, file, ...args] = process.argv.slice(2);
  try {
    if (!file) throw new Error("Uso: hansei-registro.mjs add|status|abertos <arquivo> ...");
    const rows = existsSync(file) ? parse(readFileSync(file, "utf8")) : [];
    const save = (next) => {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, render(next));
    };
    if (command === "add") {
      const result = add(rows, args.join(" "));
      save(result.rows);
      console.log(result.id);
    } else if (command === "status") {
      save(setStatus(rows, args[0], args[1], args.slice(2).join(" ")));
    } else if (command === "abertos") {
      console.log(openIds(rows).join("\n"));
    } else {
      throw new Error(`Comando desconhecido: ${command}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
