// SessionStart hook: warns when the minhas-skills folder that the sessions use (~/.claude/skills and
// ~/.claude/agents point to it) is not on main. Work on minhas-skills happens in a separate worktree
// (C:\Projetos\minhas-skills-dev), so this folder only runs reviewed, merged code.
// It is only a warning, never a block: it always exits 0, and stays silent on any error.
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The warning for the branch the folder is on, or null when it is on main. */
export function warning(branch) {
  if (branch === "main") return null;
  const where = branch ? `na branch "${branch}"` : "fora de uma branch";
  return (
    `⚠️ A pasta do minhas-skills está ${where}, não na main: as skills, os agentes e os hooks ` +
    `desta sessão vêm de código ainda não revisado. Volte-a para a main e trabalhe no worktree ` +
    `C:\\Projetos\\minhas-skills-dev.`
  );
}

// Runs only as a command, so tests can import the rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const repo = dirname(dirname(fileURLToPath(import.meta.url)));
    const branch = execFileSync("git", ["-C", repo, "branch", "--show-current"], { encoding: "utf8" }).trim();
    const text = warning(branch);
    if (text) process.stdout.write(JSON.stringify({ systemMessage: text }));
  } catch {
    // Silent: a warning hook must never get in the way.
  }
  process.exit(0);
}
