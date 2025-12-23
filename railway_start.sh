#!/bin/bash
# Railway startup script

# Debug: Check what's actually deployed
echo "=== Checking /app directory ==="
ls -la /app
echo ""
echo "=== Checking /app/backend directory ==="
ls -la /app/backend
echo ""
echo "=== Looking for app.py ==="
find /app -name "app.py" -type f 2>/dev/null || echo "No app.py found anywhere"
echo ""

# Check if app.py exists in backend directory
if [ -f "/app/backend/app.py" ]; then
    echo "app.py found in /app/backend, using that directory"
    cd /app/backend
    export PYTHONPATH=/app/backend:${PYTHONPATH}
else
    echo "WARNING: app.py NOT found in /app/backend!"
    echo "Checking if volume is mounted correctly..."
    mount | grep backend || echo "No backend volume mount found"
    exit 1
fi

echo "Current directory: $(pwd)"
echo "PYTHONPATH: $PYTHONPATH"

# Start gunicorn
exec python3 -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 --preload
