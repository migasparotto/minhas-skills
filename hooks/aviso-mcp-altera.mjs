// PreToolUse hook: before a CADCraft MCP tool changes the user's open drawing or writes a file,
// asks the user (permissionDecision "ask") with a "⚠️ ALTERA:" reason in Portuguese.
// Read-only tools, and edits in the invisible headless session, pass without a prompt.
// Claude Code passes the call as JSON on stdin ({ tool_name, tool_input, ... }).
// Not wired yet: the CADCraft MCPs live in the Ubuntu (WSL) Claude, which has no hooks; it is
// installed there with "Configurar o Claude do Ubuntu" (hansei 2026-11-07-11 of the Tambor), matcher:
//   mcp__cadcraft(-live)?__(command_line|script|execute|new_drawing|open|cancel|save|render)
import process from "node:process";
import { pathToFileURL } from "node:url";

// Tools that change the drawing or the app state (the generic ones can do anything).
const ALTERA = new Set(["command_line", "script", "execute", "new_drawing", "open", "cancel"]);

/** Short, one-line view of the tool input for the reason text. */
const resumo = (input) => JSON.stringify(input ?? {}).slice(0, 160);

/** Decides the call. Returns null to let it run, or the reason to ask the user first. */
export function motivoParaPerguntar({ tool_name, tool_input }) {
  const m = /^mcp__(cadcraft(?:-live)?)__(\w+)$/.exec(tool_name ?? "");
  if (!m) return null;
  const [, servidor, ferramenta] = m;
  const path = tool_input?.path;
  if (ferramenta === "save") return `⚠️ ALTERA: ${servidor}.save grava o arquivo ${path ?? "(caminho atual do desenho)"}.`;
  if (ferramenta === "render" && path) return `⚠️ ALTERA: ${servidor}.render grava a imagem ${path}.`;
  if (servidor === "cadcraft-live" && ALTERA.has(ferramenta))
    return `⚠️ ALTERA: ${ferramenta} muda o desenho aberto no CADCraft da sua tela: ${resumo(tool_input)}`;
  return null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input = {};
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    process.exit(0); // never block on a malformed input
  }
  const motivo = motivoParaPerguntar(input);
  if (motivo) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: motivo },
      }),
    );
  }
}
