#!/bin/bash

# 🍕 MechaPizza Village - Quick Start Script

echo "🍕 Starting MechaPizza Village..."
echo "=================================="

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "🚀 Starting development servers..."
echo ""
echo "📱 Client: http://localhost:5173"
echo "🖥️  Server: http://localhost:3000"
echo "🎮 Game: http://localhost:5173/game"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers in parallel
npm run dev