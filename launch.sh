#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for command_name in uv node npm; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing prerequisite: %s. Install it and run this script again.\n' "$command_name" >&2
    exit 1
  fi
done

node <<'JS'
const [major, minor] = process.versions.node.split('.').map(Number);
if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22)) {
  console.error('MeteoPark requires Node.js 20.19+ on v20, or Node.js 22.12+.');
  process.exit(1);
}
JS

# The frontend proxy uses port 8000. Fail clearly instead of changing ports.
node <<'JS'
const net = require('node:net');
async function checkPorts() {
  for (const port of [8000, 5173]) {
    await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', error => {
        console.error(`Cannot use port ${port}: ${error.message}`);
        console.error('Stop the service using that port, then run launch.sh again.');
        reject(error);
      });
      server.listen(port, '127.0.0.1', () => server.close(resolve));
    });
  }
}
checkPorts().catch(() => { process.exitCode = 1; });
JS

printf '\nInstalling backend dependencies with your existing uv installation...\n'
(cd "$PROJECT_DIR/backend" && uv sync --frozen --no-dev)

printf '\nInstalling frontend dependencies...\n'
(cd "$PROJECT_DIR/frontend" && npm ci --include=dev --no-audit --no-fund)

# Separate process groups let cleanup stop npm/Vite and uv/Uvicorn together.
# This also works with the Bash version bundled with macOS.
set -m
backend_pid=''
frontend_pid=''

cleanup() {
  local exit_status=$?
  local service_pid
  local attempt
  local still_running
  trap - EXIT INT TERM
  printf '\nStopping MeteoPark...\n'
  for service_pid in "$backend_pid" "$frontend_pid"; do
    if [[ -n "$service_pid" ]]; then
      kill -TERM -- "-$service_pid" 2>/dev/null || true
    fi
  done
  for attempt in 1 2 3 4 5; do
    still_running=0
    for service_pid in "$backend_pid" "$frontend_pid"; do
      if [[ -n "$service_pid" ]] && kill -0 -- "-$service_pid" 2>/dev/null; then
        still_running=1
      fi
    done
    [[ "$still_running" -eq 0 ]] && break
    sleep 1
  done
  for service_pid in "$backend_pid" "$frontend_pid"; do
    if [[ -n "$service_pid" ]]; then
      kill -KILL -- "-$service_pid" 2>/dev/null || true
      wait "$service_pid" 2>/dev/null || true
    fi
  done
  exit "$exit_status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

(
  cd "$PROJECT_DIR/backend"
  exec uv run --frozen --no-dev uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) &
backend_pid=$!

(
  cd "$PROJECT_DIR/frontend"
  exec npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
) &
frontend_pid=$!

printf '\nStarting MeteoPark. Open http://localhost:5173 once Vite is ready.\n'
printf 'API documentation: http://127.0.0.1:8000/docs\n'
printf 'Press Ctrl+C to stop both servers.\n\n'

while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do
  sleep 1
done

service_status=0
if ! kill -0 "$backend_pid" 2>/dev/null; then
  wait "$backend_pid" || service_status=$?
  printf '\nBackend stopped unexpectedly (exit status %s).\n' "$service_status" >&2
else
  wait "$frontend_pid" || service_status=$?
  printf '\nFrontend stopped unexpectedly (exit status %s).\n' "$service_status" >&2
fi
[[ "$service_status" -ne 0 ]] || service_status=1
exit "$service_status"
