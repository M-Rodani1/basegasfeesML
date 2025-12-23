#!/bin/bash
# Railway startup script - Single service with background data collection

cd /app/backend || exit 1

echo "=== Starting Gas Fees ML Service ==="
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"

# Start gunicorn with config that includes background data collection
exec gunicorn app:app --config gunicorn_config.py
