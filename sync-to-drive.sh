#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Sync don-bosco-connect → Google Drive shared folder
# Uses GVFS (GNOME Online Accounts).
# ─────────────────────────────────────────────────────────
# Usage:
#   ./sync-to-drive.sh                        Full sync (tar pipe, slow)
#   ./sync-to-drive.sh --incremental          Sync files changed in last commit
#   ./sync-to-drive.sh --files file1 file2    Sync specific files
# ─────────────────────────────────────────────────────────

set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCK_FILE="/tmp/don-bosco-gdrive-sync.lock"
LOG_FILE="$SOURCE_DIR/.gdrive-sync.log"

# ── Config ───────────────────────────────────────────
TARGET_FOLDER_ID="1he4wC5FvlVNCTtrFs00MhhlGLM4l7WYo"
PARENT_FOLDER_ID="1Tf7yJhCx6URRIcog2CehAzSLQ_1aYm56"
DRIVE_ROOT_ID="0ABhWwMM5PJp2Uk9PVA"

EXCLUDES=(
  .git node_modules __pycache__ .venv venv .cxx mobile/android
)

# ── Helpers ──────────────────────────────────────────
log()    { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
err()    { log "ERROR: $*"; exit 1; }
cleanup(){ rm -f "$LOCK_FILE"; }
trap cleanup EXIT

should_exclude() {
  local path="$1"
  for excl in "${EXCLUDES[@]}"; do
    case "$path" in
      "$excl"/*|"$excl"|*/"$excl"/*|*/"$excl") return 0 ;;
    esac
  done
  return 1
}

# ── Lock ─────────────────────────────────────────────
if [ -f "$LOCK_FILE" ]; then
  pid=$(cat "$LOCK_FILE")
  if kill -0 "$pid" 2>/dev/null; then
    log "Sync already running (PID $pid). Skipping."
    exit 0
  fi
  rm -f "$LOCK_FILE"
fi
echo $$ > "$LOCK_FILE"

# ── Find GVFS mount & target ─────────────────────────
GVFS_BASE=""
for uid_dir in /run/user/*/gvfs; do
  candidate="$uid_dir/google-drive:host=gmail.com,user=azmi.hitech"
  [ -d "$candidate" ] && { GVFS_BASE="$candidate"; break; }
done
GVFS_BASE="${GVFS_BASE:-/run/user/$(id -u)/gvfs/google-drive:host=gmail.com,user=azmi.hitech}"
[ ! -d "$GVFS_BASE" ] && err "Google Drive not mounted at $GVFS_BASE"

TARGET_PATH="$GVFS_BASE/$DRIVE_ROOT_ID/$PARENT_FOLDER_ID/$TARGET_FOLDER_ID"
[ ! -d "$TARGET_PATH" ] && TARGET_PATH=$(find "$GVFS_BASE/$DRIVE_ROOT_ID" -maxdepth 5 -type d -name "$TARGET_FOLDER_ID" 2>/dev/null | head -1)
[ -z "$TARGET_PATH" ] && err "Target folder not found on Google Drive."

log "Source  → $SOURCE_DIR"
log "Target  → $TARGET_PATH"

START=$(date +%s)

# ── Determine files to sync ─────────────────────────
MODE="${1:-full}"

case "$MODE" in
  --incremental)
    shift
    FILES=$(git -C "$SOURCE_DIR" diff-tree --no-commit-id -r --name-only HEAD 2>/dev/null || true)
    if [ -z "$FILES" ]; then
      log "No new commits to sync."
      exit 0
    fi
    log "Incremental sync: $(echo "$FILES" | wc -l) changed file(s)"
    ;;
  --files)
    shift
    FILES="$*"
    [ -z "$FILES" ] && err "No files specified."
    log "Syncing specific file(s)..."
    ;;
  *)
    # Full sync
    log "Full sync..."
    tar cf - \
      $(for e in "${EXCLUDES[@]}"; do echo --exclude="$e"; done) \
      -C "$SOURCE_DIR" . 2>/dev/null | tar xf - -C "$TARGET_PATH" 2>/dev/null
    RC="${PIPESTATUS[1]}"
    END=$(date +%s)
    [ "$RC" -eq 0 ] && log "✓ Full sync OK ($((END-START))s)" || log "⚠ Full sync code $RC ($((END-START))s)"
    log "  → https://drive.google.com/drive/folders/$TARGET_FOLDER_ID"
    exit "$RC"
    ;;
esac

# ── Incremental copy using gio ──────────────────────
cd "$SOURCE_DIR"
COPIED=0
SKIPPED=0

while IFS= read -r f; do
  [ -z "$f" ] && continue
  should_exclude "$f" && { SKIPPED=$((SKIPPED + 1)); continue; }

  # Create parent directory in target
  parent_dir="$(dirname "$f")"
  if [ "$parent_dir" != "." ]; then
    mkdir -p "$TARGET_PATH/$parent_dir" 2>/dev/null || true
  fi

  if [ -f "$f" ]; then
    gio copy "$f" "$TARGET_PATH/$f" 2>/dev/null && COPIED=$((COPIED + 1)) || SKIPPED=$((SKIPPED + 1))
  fi
done <<< "$FILES"

END=$(date +%s)
log "✓ Incremental sync: $COPIED copied, $SKIPPED skipped ($((END-START))s)"
log "  → https://drive.google.com/drive/folders/$TARGET_FOLDER_ID"
