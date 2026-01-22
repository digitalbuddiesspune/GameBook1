#!/bin/bash
# PM2 Restart Script - Clears cache and restarts with new code

echo "🔄 Stopping PM2 processes..."
pm2 stop all

echo "🧹 Clearing PM2 cache..."
pm2 flush

echo "🗑️  Deleting PM2 logs..."
pm2 delete all

echo "📦 Clearing Node.js module cache..."
rm -rf node_modules/.cache 2>/dev/null || true

echo "🚀 Starting PM2 with new code..."
pm2 start server.js --name game-book-server

echo "📊 PM2 Status:"
pm2 status

echo "📝 PM2 Logs (last 50 lines):"
pm2 logs --lines 50

echo "✅ Restart complete! Check logs above for 'NEW LOGIN HANDLER v2.0' to verify new code is running."
