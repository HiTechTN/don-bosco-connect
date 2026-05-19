#!/bin/sh
ollama serve &
sleep 10
ollama pull qwen2.5:7b-instruct
ollama pull nomic-embed-text
wait
