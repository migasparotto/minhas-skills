// Lists the PRs merged into main on a day, for the "pmp boa noite" check of Todoist and Notion.
// Usage: node prs-do-dia.mjs [AAAA-MM-DD] [owner/repo ...]
//   Without a date: today. Without repos: the repository of the current folder.
import { execFileSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** Arguments for `gh pr list` that find the PRs merged into main on `day` (AAAA-MM-DD). */
export function ghArgs(day, repo) {
  const args = ["pr", "list", "--state", "merged", "--base", "main", "--limit", "100"];
  args.push("--search", `merged:${day}`, "--json", "number,title,mergedAt,url");
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
