#!/usr/bin/env sh
set -eu

if command -v node >/dev/null 2>&1; then
  SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
  REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
  exec node "$REPO_ROOT/packages/installer/bin/install.mjs" "$@"
fi

if command -v npx >/dev/null 2>&1; then
  exec npx @visual-evidence/install@latest "$@"
fi

echo "Visual Evidence installer requires Node.js or npx." >&2
exit 1