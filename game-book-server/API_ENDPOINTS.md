# API Endpoints Documentation

## 🆕 What's New

### Recent Changes:
1. **Login System Updated (v2.0)**
   - Unified login page for both Admin and Vendor
   - Enhanced error messages
   - Support for multiple identifier fields (mobile, username, email)
   - Version 2.0 login handler with improved validation

2. **Logout Functionality**
   - Added logout buttons to both Admin and Vendor dashboards
   - Secure logout that clears all authentication data
   - Automatic redirect to login page after logout

3. **ES Modules Conversion**
   - Entire backend converted from CommonJS to ES modules
   - All imports/exports updated to use ES6 syntax

4. **Receipt Pagination**
   - Receipts endpoint now supports pagination (limit: 100 per page)
   - Added pagination metadata in responses

---

## 🔓 Public Endpoints (No Token Required)

These endpoints can be used to check if the backend is live and healthy:

### 1. Root Endpoint
```
GET /
```
**Response:**
```json
"🚀 Server is running"
```

**Example:**
```bash
curl https://your-api-domain.com/
```

---

### 2. Health Check
```
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Server healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl https://your-api-domain.com/health
```

---

### 3. Auth Routes Test
```
GET /api/auth/test
```
**Response:**
```json
{
  "success": true,
  "message": "Auth routes are working",
  "path": "/test",
  "originalUrl": "/api/auth/test",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "2.0",
  "handler": "NEW_LOGIN_HANDLER_V2"
}
```

**Example:**
```bash
curl https://your-api-domain.com/api/auth/test
```

---

### 4. Version Check
```
GET /api/auth/version
```
**Response:**
```json
{
  "success": true,
  "version": "2.0",
  "handler": "NEW_LOGIN_HANDLER_V2",
  "loginFunctionExists": true,
  "message": "If you see version 2.0, new code is running. Old code would not have this endpoint.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl https://your-api-domain.com/api/auth/version
```

---

### 5. System Health Status
```
GET /api/reports/sys/check
```
**Response:**
```json
{
  "success": true,
  "status": 1,
  "reason": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Note:** `status: 1` means system is enabled, `status: 0` means maintenance mode.

**Example:**
```bash
curl https://your-api-domain.com/api/reports/sys/check
```

---

### 6. Login Endpoint (Public)
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "mobile": "1234567890",
  "password": "your_password"
}
```

**Alternative fields accepted:**
- `identifier`, `email`, `mobile`, `username`, `phone`, `phoneNumber` (for identifier)
- `password`, `pass`, `pwd` (for password)

**Response (Success):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "mobile": "1234567890",
    "role": "vendor" // or "admin"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here",
  "version": "2.0",
  "handler": "NEW_LOGIN_HANDLER_V2"
}
```

**Example:**
```bash
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "1234567890", "password": "password123"}'
```

---

## 🔒 Protected Endpoints (Token Required)

All endpoints below require authentication token in the header:
```
Authorization: Bearer <token>
```

### Vendor Routes
- `GET /api/vendors/me` - Get vendor profile
- `PUT /api/vendors/me` - Update vendor profile
- `PUT /api/vendors/me/password` - Change password

### Customer Routes
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `PUT /api/customers/:id/balance` - Update customer balance

### Receipt Routes
- `GET /api/receipts?page=1&limit=100` - Get all receipts (paginated)
- `POST /api/receipts` - Create receipt
- `PUT /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt
- `GET /api/receipts/daily-totals?date=YYYY-MM-DD` - Get daily totals

### Report Routes
- `GET /api/reports/summary/weekly` - Weekly summary
- `GET /api/reports/summary/monthly` - Monthly summary
- `GET /api/reports/summary/yearly` - Yearly summary
- `GET /api/reports/customers/all-balances` - All customer balances
- `GET /api/reports/monthly-trends` - Monthly trends
- `GET /api/reports/top-customers` - Top customers
- `GET /api/reports/income-by-game-type` - Income by game type
- `GET /api/reports/payment-stats` - Payment statistics

### Activity Routes
- `GET /api/activities/recent` - Get recent activities

### Shortcut Routes
- `GET /api/shortcuts` - Get shortcuts
- `POST /api/shortcuts/income` - Save manual income
- `POST /api/shortcuts/bulk` - Save shortcuts in bulk

---

## 🧪 Quick Health Check Script

You can use these commands to verify your backend is live:

```bash
# Basic health check
curl https://your-api-domain.com/health

# Auth routes test
curl https://your-api-domain.com/api/auth/test

# Version check
curl https://your-api-domain.com/api/auth/version

# System health status
curl https://your-api-domain.com/api/reports/sys/check
```

---

## 📝 Notes

1. **All public endpoints** (except login) return JSON responses
2. **Login endpoint** accepts multiple field name variations for backward compatibility
3. **Version 2.0** includes improved error messages and validation
4. **System health check** (`/api/reports/sys/check`) can be used to check if the app is in maintenance mode
5. **Protected routes** require a valid JWT token in the Authorization header

---

## 🔍 Troubleshooting

If you're getting 404 errors:
- Check that the route path is correct
- Verify the server is running
- Check PM2 logs: `pm2 logs game-book-server`

If login is not working:
- Check `/api/auth/version` to verify version 2.0 is running
- Verify the request body includes `mobile` and `password` fields
- Check server logs for detailed error messages
