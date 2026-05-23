#!/bin/bash
# auto-work-loop.sh — runs the CLOTH Auto Work cycle every 5 minutes
# Usage: ./auto-work-loop.sh [interval_seconds] [market]
# Default interval: 300s (5 min). Default market: UK,HK

LOG="${HOME}/Library/Logs/cloth-auto-work.log"
CYCLE_LOG_DIR="${HOME}/Library/Logs/cloth-auto-work"
INTERVAL="${1:-300}"
MARKETS="${2:-UK,HK}"
CYCLE=0

mkdir -p "$CYCLE_LOG_DIR"

log() {
  local ts
  ts=$(date '+%H:%M:%S')
  echo "[$ts] $1" | tee -a "$LOG"
}

cycle_summary() {
  local market="$1"
  local jsonfile="$2"
  # Parse JSON directly (no ANSI issue — JSON is clean)
  local tasks esc errors has_error
  tasks=$(python3 -c "
import json,sys
try:
    d=json.load(open('$jsonfile'))
    print(d.get('summary',{}).get('totalTasksGenerated','?'))
except: print('?')
" 2>/dev/null)
  esc=$(python3 -c "
import json,sys
try:
    d=json.load(open('$jsonfile'))
    print(d.get('summary',{}).get('totalEscalations',0))
except: print(0)
" 2>/dev/null)
  errors=$(python3 -c "
import json,sys
try:
    d=json.load(open('$jsonfile'))
    print(d.get('summary',{}).get('totalErrors',0))
except: print(0)
" 2>/dev/null)
  has_error=$(python3 -c "
import json,sys
try:
    d=json.load(open('$jsonfile'))
    print(1 if any(a.get('status')=='error' for a in d.get('agents',[])) else 0)
except: print(0)
" 2>/dev/null)
  local status
  if [ "$has_error" = "1" ] || [ "$errors" -gt 0 ]; then
    status="❌ FAILED"
  elif [ "$esc" -gt 0 ]; then
    status="⚠️  ALERT"
  else
    status="✅ OK"
  fi
  echo "$status|tasks=$tasks|esc=$esc|errors=$errors"
}

run_cycle() {
  local market="$1"
  local cycle_num="$2"
  local stamp
  stamp=$(date '+%Y-%m-%d_%H%M%S')
  local out_log="${CYCLE_LOG_DIR}/${market}-cycle${cycle_num}-${stamp}.log"
  local json_out="${CYCLE_LOG_DIR}/${market}-cycle${cycle_num}-${stamp}.json"

  log "─── $market cycle $cycle_num ───"

  local start_ms
  start_ms=$(python3 -c 'import time; print(int(time.time() * 1000))')

  # Run via tsx directly (same as npm run agent:run)
  local args="--market $market"
  if [ "$DRY_RUN" = "1" ]; then
    args="$args --dry-run"
  fi
  args="$args --json --output $json_out"

  # Capture both JSON output and human-readable output
  ./node_modules/.bin/tsx scripts/run-cycle.ts $args \
    2>&1 | tee "$out_log"

  local exit_code=$?
  local summary
  summary=$(cycle_summary "$market" "$json_out")
  local duration_ms
  duration_ms=$(python3 -c "import time; print(int(time.time() * 1000) - $start_ms)")
  local duration_s=$((duration_ms / 1000))

  log "$market $summary (${duration_s}s) [exit $exit_code]"

  # Post escalation alert to Discord if needed
  if [ "$exit_code" -ne 0 ] && [ -n "$DISCORD_WEBHOOK" ]; then
    local esc_count
    esc_count=$(grep -o '"totalEscalations":[0-9]*' "$json_out" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "0")
    if [ "$esc_count" -gt 0 ]; then
      curl -s -X POST "$DISCORD_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"content\":\"⚠️ **Auto Work Escalation** — $market cycle $cycle_num has $esc_count escalation(s). Check CI logs.\"}" \
        2>/dev/null
    fi
  fi

  # Prune old logs (keep last 50 cycles)
  ls -t "$CYCLE_LOG_DIR"/"${market}-cycle"* 2>/dev/null | tail -n +51 | xargs rm -f 2>/dev/null

  return $exit_code
}

# ── Main loop ────────────────────────────────────────────────────────────────
log "═══════════════════════════════════════"
log "CLOTH Auto Work loop started"
log "Markets : $MARKETS"
log "Interval: ${INTERVAL}s"
log "Log dir : $CYCLE_LOG_DIR"
log "═══════════════════════════════════════"

# Change to project directory
cd "$(dirname "$0")/.." || { log "ERROR: cannot cd to project dir"; exit 1; }

while true; do
  CYCLE=$((CYCLE + 1))
  log ""
  log "══════ CYCLE $CYCLE ══════"

  local exit_total=0
  for market in $(echo "$MARKETS" | tr ',' ' '); do
    run_cycle "$market" "$CYCLE"
    exit_total=$((exit_total | $?))
  done

  if [ $exit_total -ne 0 ]; then
    log "⚠  Cycle $CYCLE had issues — see logs above"
  else
    log "Cycle $CYCLE clean — sleeping ${INTERVAL}s"
  fi

  sleep "$INTERVAL"
done
