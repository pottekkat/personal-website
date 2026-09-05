#!/usr/bin/env bash
#
# run.sh — perf harness driver. Starts the production-like static server over
# ./public, runs the requested suite headlessly, then shuts the server down.
#
#   ./run.sh bytes <label>                 payload audit (fast; use while iterating)
#   ./run.sh lighthouse <label> [pageIds]  Lighthouse mobile runs (slow; use for milestones)
#   ./run.sh capture <label>               visual + DOM snapshot
#   ./run.sh diff <base> <cand>            compare two snapshots
#   ./run.sh functional                    behavioural checks (search, charts)
#   ./run.sh serve                         just run the server in the foreground
#
# Every browser this launches is headless.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PORT="${PORT:-8099}"
export ORIGIN="http://127.0.0.1:${PORT}"

# Never measure ./public: a long-running `hugo server` in this repo keeps
# rewriting it with localhost URLs and a livereload script. Build each variant
# into its own directory and point SITE_DIR at it.
export SITE_DIR="${SITE_DIR:-$ROOT/test/perf/build}"

# nvm defines shell functions named `npm`/`node` that recurse under `set -u`;
# always call the real binaries.
NODE_BIN="${NODE_BIN:-$HOME/.nvm/versions/node/v22.12.0/bin/node}"
[ -x "$NODE_BIN" ] || NODE_BIN="$(command -v node)"

cmd="${1:-}"; shift || true

if [ "$cmd" = "serve" ]; then
  exec "$NODE_BIN" "$HERE/server.mjs"
fi

if [ ! -d "$SITE_DIR" ]; then
  echo "SITE_DIR=$SITE_DIR missing — build it with: hugo --gc --minify -d <dir>" >&2
  exit 1
fi

# A leftover server from an earlier run would silently serve the wrong build.
if curl -sf -o /dev/null "$ORIGIN/"; then
  echo "port ${PORT} is already serving something — stop it first (pkill -f test/perf/server.mjs)" >&2
  exit 1
fi

"$NODE_BIN" "$HERE/server.mjs" &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  if curl -sf -o /dev/null "$ORIGIN/"; then break; fi
  sleep 0.2
done

case "$cmd" in
  bytes)      "$NODE_BIN" "$HERE/bytes.mjs" "$@" ;;
  lighthouse) "$NODE_BIN" "$HERE/lighthouse.mjs" "$@" ;;
  capture)    "$NODE_BIN" "$HERE/parity.mjs" capture "$@" ;;
  diff)       "$NODE_BIN" "$HERE/parity.mjs" diff "$@" ;;
  functional) "$NODE_BIN" "$HERE/functional.mjs" "$@" ;;
  *) echo "usage: run.sh {bytes|lighthouse|capture|diff|functional|serve} ..." >&2; exit 1 ;;
esac
