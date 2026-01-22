#!/bin/bash
# Deployment Verification Script
# This script verifies that the new code is actually running

echo "🔍 Verifying Deployment..."
echo ""

# Check if server is running
echo "1. Checking if PM2 process is running..."
pm2 list | grep game-book-server
if [ $? -eq 0 ]; then
    echo "   ✅ PM2 process found"
else
    echo "   ❌ PM2 process NOT found!"
    exit 1
fi

echo ""
echo "2. Checking server logs for version identifier..."
pm2 logs game-book-server --lines 20 --nostream | grep -i "version\|login handler\|v2.0"
if [ $? -eq 0 ]; then
    echo "   ✅ Version 2.0 found in logs"
else
    echo "   ⚠️  Version 2.0 NOT found in logs - checking all logs..."
    pm2 logs game-book-server --lines 50 --nostream | tail -20
fi

echo ""
echo "3. Testing version check endpoint..."
API_URL="${API_URL:-https://api.gamebook1.online}"
VERSION_CHECK=$(curl -s "${API_URL}/api/version-check" 2>/dev/null)
if echo "$VERSION_CHECK" | grep -q "2.0"; then
    echo "   ✅ Version 2.0 detected via API"
    echo "   Response: $VERSION_CHECK"
else
    echo "   ❌ Version 2.0 NOT detected via API"
    echo "   Response: $VERSION_CHECK"
fi

echo ""
echo "4. Testing auth version endpoint..."
AUTH_VERSION=$(curl -s "${API_URL}/api/auth/version" 2>/dev/null)
if echo "$AUTH_VERSION" | grep -q "2.0"; then
    echo "   ✅ Version 2.0 detected via auth endpoint"
    echo "   Response: $AUTH_VERSION"
else
    echo "   ❌ Version 2.0 NOT detected via auth endpoint"
    echo "   Response: $AUTH_VERSION"
fi

echo ""
echo "5. Testing login endpoint (should return new error message)..."
LOGIN_TEST=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"test":"test"}' 2>/dev/null)

if echo "$LOGIN_TEST" | grep -q "mobile number"; then
    echo "   ✅ NEW error message detected (mobile number)"
    if echo "$LOGIN_TEST" | grep -q "version.*2.0"; then
        echo "   ✅ Version 2.0 in response"
    else
        echo "   ⚠️  Version 2.0 NOT in response"
    fi
elif echo "$LOGIN_TEST" | grep -q "email and password"; then
    echo "   ❌ OLD error message detected (email and password) - OLD CODE IS RUNNING!"
    echo "   Response: $LOGIN_TEST"
else
    echo "   ⚠️  Unexpected response:"
    echo "   $LOGIN_TEST"
fi

echo ""
echo "📋 Summary:"
echo "   - If you see 'mobile number' in error: NEW CODE ✅"
echo "   - If you see 'email and password' in error: OLD CODE ❌"
echo "   - Check PM2 logs: pm2 logs game-book-server"
echo "   - Check version: curl ${API_URL}/api/version-check"
