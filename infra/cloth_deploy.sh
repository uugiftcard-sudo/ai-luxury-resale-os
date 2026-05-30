#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: infra/cloth_deploy.sh <ssh_target> <remote_dir> <public_base_url> [--install-nginx]"
  echo "Example: infra/cloth_deploy.sh root@167.172.60.38 /opt/cloth https://cloth.staging.buyeros.com"
  exit 2
fi

SSH_TARGET="$1"
REMOTE_DIR="$2"
PUBLIC_BASE_URL="${3%/}"
INSTALL_NGINX="0"

for arg in "${@:4}"; do
  if [[ "$arg" == "--install-nginx" ]]; then
    INSTALL_NGINX="1"
  fi
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${REMOTE_DIR}/releases/${STAMP}"
BACKUP_DIR="${REMOTE_DIR}/backups"
TMP_DIR="$(mktemp -d)"
ARCHIVE="${TMP_DIR}/cloth-${STAMP}.tgz"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

wait_for_http() {
  local url="$1"
  local attempts="${2:-30}"
  local delay="${3:-3}"

  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS --max-time 5 "$url" >/dev/null 2>&1; then
      echo "Ready: $url"
      return 0
    fi
    echo "Waiting for $url ($i/$attempts)..."
    sleep "$delay"
  done

  echo "Service did not become ready: $url"
  return 1
}

cd "$ROOT_DIR"

echo "== local validation =="
npm run check

echo "== package committed source =="
git archive --format=tar HEAD | gzip -c > "$ARCHIVE"

echo "== prepare remote release =="
ssh "$SSH_TARGET" "set -euo pipefail; mkdir -p '$RELEASE_DIR' '$BACKUP_DIR' '${REMOTE_DIR}/shared/data'"
scp "$ARCHIVE" "$SSH_TARGET:${RELEASE_DIR}/source.tgz"
scp "$ROOT_DIR/infra/cloth.service" "$SSH_TARGET:${RELEASE_DIR}/cloth.service"
scp "$ROOT_DIR/infra/nginx-cloth.conf" "$SSH_TARGET:${RELEASE_DIR}/nginx-cloth.conf"

echo "== install release =="
ssh "$SSH_TARGET" "set -euo pipefail
  cd '$RELEASE_DIR'
  tar -xzf source.tgz
  rm source.tgz
  mkdir -p '${REMOTE_DIR}/shared/data'
  rm -rf api/data
  ln -s '${REMOTE_DIR}/shared/data' api/data
  npm ci
  npm run build
  if [[ -L '${REMOTE_DIR}/current' || -d '${REMOTE_DIR}/current' ]]; then
    tar -czf '${BACKUP_DIR}/cloth-before-${STAMP}.tgz' -C '${REMOTE_DIR}' current
  fi
  ln -sfn '$RELEASE_DIR' '${REMOTE_DIR}/current'
  cp '$RELEASE_DIR/cloth.service' /etc/systemd/system/cloth.service
  systemctl daemon-reload
  systemctl enable cloth.service
  systemctl restart cloth.service
  if [[ '$INSTALL_NGINX' == '1' ]]; then
    cp '$RELEASE_DIR/nginx-cloth.conf' /etc/nginx/sites-available/cloth.conf
    ln -sfn /etc/nginx/sites-available/cloth.conf /etc/nginx/sites-enabled/cloth.conf
    nginx -t
    systemctl reload nginx
  fi
  systemctl --no-pager --full status cloth.service | sed -n '1,20p'
"

echo "== smoke =="
wait_for_http "${PUBLIC_BASE_URL}/api/health" "${CLOTH_DEPLOY_WAIT_ATTEMPTS:-30}" "${CLOTH_DEPLOY_WAIT_DELAY:-3}"

echo "CLOTH deploy OK: ${SSH_TARGET} ${PUBLIC_BASE_URL}"
