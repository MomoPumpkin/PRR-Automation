#!/bin/bash

# Exit on error
set -e

# Determine Python command (python or python3)
if command -v python &> /dev/null; then
    PYTHON_CMD="python"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    echo "Error: Neither 'python' nor 'python3' command found. Please install Python 3.11+ and try again."
    exit 1
fi

echo "Using Python command: $PYTHON_CMD"

# Create virtual environment for backend if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment for backend..."
    cd backend
    $PYTHON_CMD -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies for backend
echo "Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Create uploads and results directories if they don't exist
mkdir -p uploads results

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 8000 is already in use. Attempting to free it..."
    # Try to kill the process using port 8000
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend in background
echo "Starting backend server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start with retry mechanism
echo "Waiting for backend to start..."
MAX_RETRIES=10
RETRY_COUNT=0
BACKEND_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Checking if backend is running (attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
    if curl -s http://localhost:8000/docs > /dev/null; then
        BACKEND_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 3
done

if [ "$BACKEND_READY" = false ]; then
    echo "Error: Backend server failed to start after $MAX_RETRIES attempts. Check the logs for more information."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "Backend server is running."

# Install dependencies for frontend
echo "Installing frontend dependencies..."
cd frontend
npm install

# Create public/logo192.png if it doesn't exist
mkdir -p public
if [ ! -f "public/logo192.png" ]; then
    echo "Creating placeholder logo..."
    # Create a simple 1x1 pixel transparent PNG
    echo -e "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1F\x15\xC4\x89\x00\x00\x00\x0A\x49\x44\x41\x54\x78\x9C\x63\x00\x01\x00\x00\x05\x00\x01\x0D\x0A\x2D\xB4\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82" > public/logo192.png
fi

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 3000 is already in use. Attempting to free it..."
    # Try to kill the process using port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!
cd ..

# Function to handle script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

echo "PRR Automation is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop the servers."

# Wait for user to press Ctrl+C
wait