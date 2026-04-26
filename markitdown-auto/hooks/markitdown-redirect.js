#!/usr/bin/env node
// hook schema v1 — Claude Code PreToolUse
const { pathToFileURL } = require("url");

const SUPPORTED = /\.(pdf|docx|doc|pptx|xlsx|xls|epub|csv|html|htm|rtf|odt|ods|odp|eml|msg|zip)$/i;
// Allow any file:/// path that contains no shell-meaningful or control chars.
// Was previously a strict allowlist that rejected PT-BR filenames with [ ] & ' = ! @ # ~
// (very common in this user's repos, e.g. Notas_Fiscais_Organizadas/).
const UNSAFE_URI_CHAR = /[\x00-\x1f\x7f"\\`\$;|<>{}*?]/;
const SAFE_URI = {
  test: (uri) => uri.startsWith("file:///") && !UNSAFE_URI_CHAR.test(uri),
};
const DEBUG = process.env.MARKITDOWN_AUTO_DEBUG === "1";
const DISABLED = process.env.MARKITDOWN_AUTO_DISABLE === "1";

function debug(msg) {
  if (DEBUG) process.stderr.write(`[markitdown-auto] ${msg}\n`);
}

const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  if (DISABLED) {
    debug("disabled via MARKITDOWN_AUTO_DISABLE=1");
    process.exit(0);
  }

  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch (err) {
    debug(`json parse failed: ${err.message}`);
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path ?? "";
  if (!filePath || !SUPPORTED.test(filePath)) {
    process.exit(0);
  }

  let uri;
  try {
    uri = pathToFileURL(filePath).href;
  } catch (err) {
    debug(`pathToFileURL failed for ${filePath}: ${err.message}`);
    process.exit(0);
  }

  if (!SAFE_URI.test(uri)) {
    debug(`rejected unsafe uri: ${uri}`);
    process.exit(0);
  }

  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        "Para economia de tokens, NÃO use Read neste arquivo. " +
        "Em vez disso, chame o MCP markitdown: " +
        "`mcp__markitdown__convert_to_markdown` com a URI abaixo " +
        "(entre crases para evitar interpretação):\n\n" +
        "```\n" + uri + "\n```\n\n" +
        "Isso converte localmente via MarkItDown e retorna Markdown " +
        "(5-10x menos tokens que ler o arquivo cru). " +
        "Caso o MCP markitdown não esteja disponível, exporte " +
        "MARKITDOWN_AUTO_DISABLE=1 e tente Read novamente.",
    },
  };

  process.stdout.write(JSON.stringify(response));
});
