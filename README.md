# pi-google-url-context

[![ci](https://github.com/code-yeongyu/pi-google-url-context/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/pi-google-url-context/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Google native URL context extension for the [pi coding agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent).

This package is the standalone extraction of senpi's former builtin `google-url-context` extension.

## Behavior

The extension does not register a new tool. It intercepts Google provider requests before they are sent and ensures a native `urlContext` tool is present for `google-generative-ai` / `google-vertex` payloads when URL context is enabled via default-on env toggle.

| Case | Result |
|------|--------|
| API is `google-generative-ai` or `google-vertex`, `PI_GOOGLE_URL_CONTEXT` is unset/empty/truthy/unknown, and no Tool object has a `urlContext` key | injects a new Tool entry `{ urlContext: {} }` |
| Existing Tool object already has `urlContext` key (any value) | preserves caller payload without duplication or overwrite |
| Existing Tool object has only `functionDeclarations` | keeps that object and adds separate `{ urlContext: {} }` entry |
| `PI_GOOGLE_URL_CONTEXT` is falsy (`0`/`false`/`no`/`off`) | no-op |
| API is non-Google | no-op |

Truthy values for `PI_GOOGLE_URL_CONTEXT` are: `1`, `true`, `yes`, `on` (case-insensitive, surrounding whitespace allowed). Unknown values follow documented default-on behavior.

It also appends a system-prompt section for Google sessions indicating native `url_context` availability when enabled.

## Installation

The package targets the [`pi`](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) coding agent. Pi loads extensions from `~/.pi/agent/extensions/`, project `.pi/extensions/`, or via the `--extension` / `-e` CLI flag.

```bash
# From npm (once published)
pi install npm:pi-google-url-context

# From git
pi install git:github.com/code-yeongyu/pi-google-url-context

# Manual placement
git clone https://github.com/code-yeongyu/pi-google-url-context ~/.pi/agent/extensions/pi-google-url-context
cd ~/.pi/agent/extensions/pi-google-url-context && npm install

# Dev / one-shot test
pi -e /path/to/pi-google-url-context/src/index.ts
```

After installation, restart pi or run `/reload` inside an interactive session.

## Development

```bash
npm install
npm test
npm run typecheck
npm run check
pi -e ./src/index.ts
```

The test suite uses vitest. TypeScript is strict, Node-only, and uses ESM imports with `.js` suffixes.

## Origin

Ported from `packages/coding-agent/src/core/extensions/builtin/google-url-context/index.ts` in the senpi-mono fork of pi-mono.

## Related

- [senpi](https://github.com/code-yeongyu/senpi) — the fork/runtime these extensions are extracted from.
- [Ultraworkers Discord](https://discord.gg/PUwSMR9XNk) — community link from the senpi README.
- [Dori](https://sisyphuslabs.ai) — the product powered by senpi under the hood.
