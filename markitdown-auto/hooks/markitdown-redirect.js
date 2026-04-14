#!/usr/bin/env node
const { pathToFileURL } = require("url");

const SUPPORTED = /\.(pdf|docx|pptx|xlsx|xls|doc|epub)$/i;

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw || "{}");
    const filePath = input?.tool_input?.file_path ?? "";

    if (!filePath || !SUPPORTED.test(filePath)) {
      process.exit(0);
    }

    const uri = pathToFileURL(filePath).href;

    const response = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Para economia de tokens, NÃO use Read neste arquivo. ` +
          `Em vez disso, chame o MCP markitdown: ` +
          `mcp__markitdown__convert_to_markdown com uri="${uri}". ` +
          `Isso converte localmente via MarkItDown e retorna Markdown ` +
          `(5-10x menos tokens que ler o arquivo cru).`,
      },
    };

    process.stdout.write(JSON.stringify(response));
  } catch {
    process.exit(0);
  }
});
