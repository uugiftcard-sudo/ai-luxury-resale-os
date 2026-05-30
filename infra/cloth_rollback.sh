#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: infra/cloth_rollback.sh <ssh_target> <remote_dir> [backup_archive]"
  echo "Example: infra/cloth_rollback.sh root@167.172.60.38 /opt/cloth"
  exit 2
fi

SSH_TARGET="$1"
REMOTE_DIR="$2"
BACKUP_ARCHIVE="${3:-}"
STAMP="$(date +%Y%m%d%H%M%S)"

ssh "$SSH_TARGET" "set -euo pipefail
  BACKUP='$BACKUP_ARCHIVE'
  if [[ -z \"\$BACKUP\" ]]; then
    BACKUP=\$(ls -1t '${REMOTE_DIR}/backups'/cloth-before-*.tgz 2>/dev/null | head -n 1 || true)
  fi
  if [[ -z \"\$BACKUP\" || ! -f \"\$BACKUP\" ]]; then
    echo 'No CLOTH rollback backup found'
    exit 1
  fi
  RESTORE_DIR='${REMOTE_DIR}/releases/rollback-${STAMP}'
  mkdir -p \"\$RESTORE_DIR\"
  tar -xzf \"\$BACKUP\" -C \"\$RESTORE_DIR\"
  if [[ -d \"\$RESTORE_DIR/current\" ]]; then
    TARGET=\"\$RESTORE_DIR/current\"
  else
    TARGET=\"\$RESTORE_DIR\"
  fi
  ln -sfn \"\$TARGET\" '${REMOTE_DIR}/current'
  systemctl restart cloth.service
  systemctl --no-pager --full status cloth.service | sed -n '1,20p'
  echo \"CLOTH rollback OK: \$BACKUP\"
"
