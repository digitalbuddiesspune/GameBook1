# Troubleshooting: "Please provide email and password" Error

## If you're still seeing the old error after git pull and PM2 restart:

### Step 1: Verify Code is Actually Updated
```bash
cd /path/to/game-book-server
git pull
git log -1  # Check latest commit
grep -r "Please provide email and password" .  # Should return NOTHING
grep -r "NEW LOGIN HANDLER v2.0" controllers/authController.js  # Should find it
```

### Step 2: Check for Multiple PM2 Processes
```bash
pm2 list
# If you see multiple game-book-server processes, delete all and restart
pm2 delete all
pm2 start server.js --name game-book-server
```

### Step 3: Verify You're in the Right Directory
```bash
pwd  # Should be in game-book-server directory
ls -la server.js  # Should exist
ls -la controllers/authController.js  # Should exist
```

### Step 4: Hard Restart PM2
```bash
pm2 kill
# Wait 5 seconds
cd /path/to/game-book-server
pm2 start server.js --name game-book-server
pm2 save  # Save PM2 config
```

### Step 5: Check Server Logs
```bash
pm2 logs game-book-server | grep -i "version\|login handler"
# Should see: "NEW LOGIN HANDLER v2.0"
```

### Step 6: Test Version Endpoint
```bash
curl https://api.gamebook1.online/api/version-check
# Should return: "version": "2.0"
```

### Step 7: Test Login Endpoint
```bash
curl -X POST https://api.gamebook1.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test","password":"test"}'
# Should return error with "mobile number" NOT "email and password"
```

## Common Issues:

### Issue 1: PM2 is Running Old Code from Different Directory
**Solution:**
```bash
pm2 list
pm2 describe game-book-server  # Check the script path
# Make sure it points to the correct directory
pm2 delete game-book-server
cd /correct/path/to/game-book-server
pm2 start server.js --name game-book-server
```

### Issue 2: Node.js Module Cache
**Solution:**
```bash
pm2 delete all
rm -rf node_modules/.cache
pm2 start server.js --name game-book-server
```

### Issue 3: Multiple Server Instances
**Solution:**
```bash
# Check all Node processes
ps aux | grep node
# Kill all and restart
pkill -f node
pm2 start server.js --name game-book-server
```

### Issue 4: API Gateway / Reverse Proxy Caching
**Solution:**
- Check if you're using AWS API Gateway, Cloudflare, or Nginx
- Clear their cache
- Check if there's a CDN in front

### Issue 5: Code Not Deployed to Production Server
**Solution:**
```bash
# SSH into production server
# Verify you're on the production server, not staging
hostname
# Pull latest code
git pull origin main  # or master
# Verify files are updated
cat controllers/authController.js | head -5
# Should see: "Version: 2.0"
```

## Verification Checklist:

- [ ] Git pull completed successfully
- [ ] Files show "Version 2.0" in authController.js
- [ ] PM2 process is running from correct directory
- [ ] PM2 logs show "NEW LOGIN HANDLER v2.0"
- [ ] /api/version-check returns version 2.0
- [ ] Login error says "mobile number" not "email and password"
- [ ] Error response includes "version": "2.0"

## If Still Not Working:

1. **Check if there's a different deployment:**
   - Staging vs Production
   - Different server instance
   - Docker container with old code

2. **Check browser cache:**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache
   - Try incognito mode

3. **Check API response directly:**
   - Use Postman/curl, not browser
   - Check response headers for cache-control
   - Verify the actual response body

4. **Contact support with:**
   - PM2 logs
   - Output of: `curl https://api.gamebook1.online/api/version-check`
   - Output of: `pm2 describe game-book-server`
