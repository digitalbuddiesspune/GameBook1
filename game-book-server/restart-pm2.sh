#!/bin/bash
# PM2 Restart Script - Clears cache and restarts with new code
# This script aggressively clears all caches to ensure new code loads

echo "🔄 Stopping PM2 processes..."
pm2 stop all

echo "🧹 Clearing PM2 cache..."
pm2 flush

echo "🗑️  Deleting PM2 processes..."
pm2 delete all

echo "📦 Clearing Node.js module cache and temp files..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf dist 2>/dev/null || true

echo "🔄 Clearing system cache (if on Linux)..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || echo "Cannot clear system cache (not root or not Linux)"

echo "⏳ Waiting 3 seconds for processes to fully stop..."
sleep 3

echo "🚀 Starting PM2 with new code..."
cd "$(dirname "$0")"
pm2 start server.js --name game-book-server --update-env

echo "⏳ Waiting 2 seconds for server to start..."
sleep 2

echo "📊 PM2 Status:"
pm2 status

echo "📝 PM2 Logs (last 100 lines - looking for VERSION 2.0):"
pm2 logs game-book-server --lines 100 --nostream | grep -E "(VERSION|LOGIN|SERVER)" || pm2 logs game-book-server --lines 50 --nostream

echo ""
echo "✅ Restart complete!"
echo "🔍 To verify new code is running, check for:"
echo "   - 'NEW LOGIN HANDLER v2.0' in logs"
echo "   - 'VERSION 2.0' in logs"
echo "   - Test: curl https://api.gamebook1.online/api/auth/version"
echo ""
echo "📋 To monitor logs in real-time:"
echo "   pm2 logs game-book-server"
