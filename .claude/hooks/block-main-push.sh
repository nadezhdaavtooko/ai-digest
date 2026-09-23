#!/usr/bin/env bash
# astroblog capstone: PreToolUse-хук, фаза 08. Блокирует git push в main без флага CAPSTONE_ALLOW_MAIN_PUSH=1.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JQ="$SCRIPT_DIR/../../../tools/jq/jq.exe"
DATA=$(cat)
TOOL=$(echo "$DATA" | "$JQ" -r '.tool_name // ""')
CMD=$(echo "$DATA" | "$JQ" -r '.tool_input.command // ""')

if [ "$TOOL" != "Bash" ]; then
  exit 0
fi

if echo "$CMD" | grep -qE 'git[[:space:]]+push[[:space:]].*(main|master)'; then
  if [ "${CAPSTONE_ALLOW_MAIN_PUSH:-0}" != "1" ]; then
    echo "BLOCK: прямой push в main запрещён. Коммитим в digest/auto, merge — ручной шаг." >&2
    exit 2
  fi
fi

exit 0
