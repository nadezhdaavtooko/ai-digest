#!/usr/bin/env bash
# astroblog capstone: PostToolUse-хук, фаза 06. Логирует каждый вызов инструмента в logs/pipeline.log.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JQ="$SCRIPT_DIR/../../../tools/jq/jq.exe"
DATA=$(cat)
LOG_DIR="logs"
mkdir -p "$LOG_DIR"

TS=$(date -Iseconds)
TOOL=$(echo "$DATA" | "$JQ" -r '.tool_name // "unknown"')
INPUT_PREVIEW=$(echo "$DATA" | "$JQ" -r '.tool_input | tostring' | head -c 200 | tr '\n' ' ')

echo "$TS  $TOOL  $INPUT_PREVIEW" >> "$LOG_DIR/pipeline.log"
