#!/bin/sh
set -e
# MinIO image bakes in _FILE env vars (MINIO_ROOT_USER_FILE=access_key, etc.)
# These override MINIO_ROOT_USER/MINIO_ROOT_PASSWORD env vars.
# Solution: write credential files to the paths _FILE points to.
echo -n "${MINIO_ROOT_USER:-minioadmin}" > /data/access_key
echo -n "${MINIO_ROOT_PASSWORD:-minioadmin}" > /data/secret_key
# Start MinIO server
exec minio server /data --console-address ":9001"
