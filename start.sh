#!/bin/bash
# Start script for Railway deployment

cd backend

# Start worker in background
python3 worker.py &

# Start gunicorn web server
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120
