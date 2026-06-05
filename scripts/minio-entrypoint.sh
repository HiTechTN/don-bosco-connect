#!/bin/sh
set -e
# MinIO image bakes in _FILE env vars (MINIO_ROOT_USER_FILE=access_key, etc.)
# These cause MinIO binary to read credentials from files.
# We create those files so MinIO picks up the correct credentials.
# NOTE: MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are resolved by
# docker-compose at config time from .env, so they contain literal values.
echo -n "${MINIO_ROOT_USER}" > /access_key
echo -n "${MINIO_ROOT_PASSWORD}" > /secret_key
# Start MinIO server
exec minio server /data --console-address ":9001"
