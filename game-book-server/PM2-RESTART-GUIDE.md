# PM2 Restart Guide - Fix "Please provide email and password" Error

## The Problem
If you're still seeing "Please provide email and password" error, PM2 is likely caching the old code.

## Solution: Force PM2 to Reload New Code

### Step 1: Stop and Delete All PM2 Processes
```bash
pm2 stop all
pm2 delete all
```

### Step 2: Clear PM2 Cache
```bash
pm2 flush
```

### Step 3: Clear Node.js Module Cache (if exists)
```bash
rm -rf node_modules/.cache
```

### Step 4: Restart PM2
```bash
cd /path/to/game-book-server
pm2 start server.js --name game-book-server
```

### Step 5: Verify New Code is Running
Check the logs for version identifier:
```bash
pm2 logs game-book-server | grep "NEW LOGIN HANDLER v2.0"
```

You should see: `➡️ [LOGIN] ========== NEW LOGIN HANDLER v2.0 ==========`

### Step 6: Test the Version Endpoint
```bash
curl https://api.gamebook1.online/api/auth/version
```

Expected response:
```json
{
  "success": true,
  "version": "2.0",
  "handler": "NEW_LOGIN_HANDLER_V2",
  "message": "If you see version 2.0, new code is running..."
}
```

### Step 7: Test Login Endpoint
If you get an error, check the response for:
- `version: "2.0"` - New code is running ✅
- `handler: "NEW_LOGIN_HANDLER_V2"` - New code is running ✅
- If these are missing, old code is still cached ❌

## Alternative: Hard Restart
```bash
pm2 kill
pm2 resurrect  # Only if you have saved PM2 config
# OR
pm2 start server.js --name game-book-server
```

## Verify in Browser Console
After login attempt, check the error response. It should have:
- `version: "2.0"`
- `handler: "NEW_LOGIN_HANDLER_V2"`
- Message should say "mobile number (or username)" NOT "email and password"

If you still see "Please provide email and password" without version/handler fields, PM2 cache needs to be cleared.
