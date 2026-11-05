// Lists the PRs merged into main on a day, for the "pmp boa noite" check of Todoist and Notion.
// Usage: node prs-do-dia.mjs [AAAA-MM-DD] [owner/repo ...]
//   Without a date: today. Without repos: the repository of the current folder.
import { execFileSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** Minutes east of UTC on `day` in the local time zone (-180 for -03:00). */
export function localOffset(day) {
  return -new Date(`${day}T12:00:00`).getTimezoneOffset();
}

/** The whole local `day` as a GitHub search range with the offset (`merged:` alone is a UTC day). */
export function dayRange(day, offsetMinutes) {
  const pad = (n) => String(n).padStart(2, "0");
  const abs = Math.abs(offsetMinutes);
  const zone = `${offsetMinutes < 0 ? "-" : "+"}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  return `${day}T00:00:00${zone}..${day}T23:59:59${zone}`;
}

/**
 * Arguments for `gh pr list` that find the PRs merged into main on the local `day` (AAAA-MM-DD).
 * `offsetMinutes` defaults to the local time zone.
 */
export function ghArgs(day, repo, offsetMinutes = localOffset(day)) {
  const args = ["pr", "list", "--state", "merged", "--base", "main", "--limit", "100"];
  args.push("--search", `merged:${dayRange(day, offsetMinutes)}`, "--json", "number,title,mergedAt,url");
  if (repo) args.push("--repo", repo);
  return args;
}

/** One line per PR, oldest first. */
export function format(repo, prs) {
  if (prs.length === 0) return [`${repo}: nenhum PR entrou na main.`];
  return [...prs]
    .sort((a, b) => a.mergedAt.localeCompare(b.mergedAt))
    .map((pr) => `${repo}#${pr.number} ${pr.title} (${pr.url})`);
}

/** Today in the local time zone, as AAAA-MM-DD. */
export function today(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Runs only as a command, so tests can import the rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(args[0] ?? "") ? args.shift() : today();
  const repos = args.length > 0 ? args : [null];
  for (const repo of repos) {
    const name = repo ?? execFileSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], { encoding: "utf8" }).trim();
    const prs = JSON.parse(execFileSync("gh", ghArgs(day, repo), { encoding: "utf8" }));
    console.log(format(name, prs).join("\n"));
  }
}
