#!/bin/bash

# Development server start script
echo "🚀 Starting Dermin AI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Start the server
echo "🔥 Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
