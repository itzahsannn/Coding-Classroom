#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping project..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting Coding Classroom..."

# Start backend
echo "📦 Starting Backend on port 5000..."
(cd backend && npm run dev) &

# Start frontend
echo "💻 Starting Frontend on port 5173..."
(cd frontend && npm run dev) &

# Keep the script running to catch SIGINT
wait
