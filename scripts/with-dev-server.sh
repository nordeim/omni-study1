#!/usr/bin/env bash
# with-dev-server.sh <command...> — boots the studyflow dev server, waits for
# health, runs the given command against it, then tears the server down.
# Exists because this sandbox reaps every background process when the parent
# bash call returns: server + probe must live inside ONE invocation.
set -u
cd "$(dirname "$0")/.."

LOG=/tmp/dev-server.log
: > "$LOG"
bun run dev > "$LOG" 2>&1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" 2>/dev/null
  wait "$DEV_PID" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
  pkill -f "next dev" 2>/dev/null
}
trap cleanup EXIT INT TERM

# Wait for /api/health (up to 120s).
for i in $(seq 1 60); do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "dev server died during boot:" >&2
    tail -20 "$LOG" >&2
    exit 1
  fi
done

if ! curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "dev server never became healthy:" >&2
  tail -20 "$LOG" >&2
  exit 1
fi

echo "[with-dev-server] healthy — running: $*"
"$@"
STATUS=$?
exit $STATUS
