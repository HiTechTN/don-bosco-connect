#!/bin/bash
# Entrypoint script for Ollama container
# Pulls required models if not already present

set -e

echo "Starting Ollama server..."
ollama serve &

OLLAMA_PID=$!

echo "Waiting for Ollama to be ready..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
    sleep 2
done

echo "Ollama ready. Checking models..."

# Pull chat model
if ! curl -s http://localhost:11434/api/tags | grep -q "qwen2.5:7b-instruct"; then
    echo "Pulling qwen2.5:7b-instruct..."
    ollama pull qwen2.5:7b-instruct
    echo "qwen2.5:7b-instruct pulled successfully."
else
    echo "qwen2.5:7b-instruct already present."
fi

# Pull embedding model
if ! curl -s http://localhost:11434/api/tags | grep -q "nomic-embed-text"; then
    echo "Pulling nomic-embed-text..."
    ollama pull nomic-embed-text
    echo "nomic-embed-text pulled successfully."
else
    echo "nomic-embed-text already present."
fi

echo "All models ready."

# Keep Ollama running in foreground
wait $OLLAMA_PID
