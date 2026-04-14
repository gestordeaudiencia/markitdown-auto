# markitdown-auto

Plugin Claude Code que **economiza 5-10x em tokens** ao processar arquivos binários/estruturados.

## Como funciona

Sempre que o Claude tenta usar `Read` num arquivo PDF/DOCX/PPTX/XLSX/EPUB, esse hook intercepta e instrui ele a usar o [MarkItDown MCP](https://github.com/microsoft/markitdown) da Microsoft — que converte o arquivo **localmente** pra Markdown e só manda o texto limpo pro modelo.

### Antes vs depois

| Cenário | Tokens gastos (PDF 10 páginas) |
|---|---|
| `Read` direto no PDF | ~20-30k tokens |
| Com `markitdown-auto` | ~3-5k tokens |

## Pré-requisitos

### 1. Node.js

Já vem com o Claude Code. Nada pra instalar.

### 2. MarkItDown MCP

Instala uma vez (global):

```bash
claude mcp add markitdown --scope user -- uvx --from markitdown-mcp markitdown-mcp
```

Requer [`uv`](https://github.com/astral-sh/uv) (recomendado) ou `pip install markitdown-mcp`.

Verifica se conectou:

```bash
claude mcp list
```

Deve mostrar `markitdown: ... - ✓ Connected`.

## Instalação do plugin

Dentro do Claude Code:

```
/plugin marketplace add gestordeaudiencia/markitdown-auto
/plugin install markitdown-auto@markitdown-auto
```

Depois reinicia o Claude Code (ou abre `/hooks` uma vez pro watcher pegar).

## Formatos suportados

- **PDF** (`.pdf`)
- **Word** (`.docx`, `.doc`)
- **PowerPoint** (`.pptx`)
- **Excel** (`.xlsx`, `.xls`)
- **EPub** (`.epub`)

Todos outros formatos passam normalmente pelo `Read` nativo.

## Compatibilidade

- macOS ✅
- Linux ✅
- Windows ✅ (hook em Node.js puro, sem dependência de bash/jq)

## Como desativar temporariamente

```
/plugin disable markitdown-auto@markitdown-auto
```

## Estrutura do plugin

```
markitdown-auto/
├── .claude-plugin/
│   └── marketplace.json
├── markitdown-auto/
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── hooks/
│       ├── hooks.json
│       └── markitdown-redirect.js
└── README.md
```

## Licença

MIT
