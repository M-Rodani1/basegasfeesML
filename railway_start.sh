#!/bin/bash
# Railway startup script

# Debug: Check what's actually deployed
echo "=== Checking /app directory ==="
ls -la /app
echo ""
echo "=== Looking for app.py ==="
find /app -name "app.py" -type f 2>/dev/null || echo "No app.py found anywhere"
echo ""

# Check if backend directory exists
if [ -d "/app/backend" ]; then
    echo "backend directory exists, using /app/backend"
    cd /app/backend
    export PYTHONPATH=/app/backend:${PYTHONPATH}
else
    echo "backend directory does NOT exist, using /app directly"
    cd /app
    export PYTHONPATH=/app:${PYTHONPATH}
fi

echo "Current directory: $(pwd)"
echo "PYTHONPATH: $PYTHONPATH"

# Start gunicorn
exec python3 -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 --preload
