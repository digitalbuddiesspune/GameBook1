# Market Details API Documentation

## Overview
The Market Details API allows you to save and retrieve open/close market values and game rows for customers on a per-market, per-day basis.

## Base URL
```
/api/market-details
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Create or Update Market Details
**POST** `/api/market-details`

Creates new market details or updates existing ones for a customer+market+date combination.

**Request Body:**
```json
{
  "customerId": "68e901a30b634680f54a5832",
  "companyName": "कल्याण",
  "date": "2026-01-31",
  "open": "12",
  "close": "15",
  "jod": "3",
  "gameRowOpen": {
    "type": "आ.",
    "income": "100",
    "o": "5",
    "jod": "10",
    "ko": "8",
    "multiplier": 8,
    "pan": { "val1": "1", "val2": "2", "type": "sp" },
    "gun": { "val1": "3", "val2": "4" },
    "special": { "val1": "5", "val2": "6", "type": "jackpot" }
  },
  "gameRowClose": {
    "type": "कु.",
    "income": "200",
    "o": "10",
    "jod": "20",
    "ko": "15",
    "multiplier": 9,
    "pan": { "val1": "2", "val2": "3", "type": "sp" },
    "gun": { "val1": "4", "val2": "5" },
    "special": { "val1": "6", "val2": "7", "type": "jackpot" }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Market details saved successfully",
  "marketDetails": {
    "_id": "...",
    "vendorId": "...",
    "customerId": "...",
    "companyName": "कल्याण",
    "date": "2026-01-31",
    "open": "12",
    "close": "15",
    "jod": "3",
    "gameRowOpen": {...},
    "gameRowClose": {...},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Note:** All fields except `customerId`, `companyName`, and `date` are optional. The endpoint uses upsert logic, so it will create if doesn't exist or update if it does.

---

### 2. Get Market Details
**GET** `/api/market-details/:customerId/:companyName/:date`

Retrieves market details for a specific customer, market, and date.

**Parameters:**
- `customerId` - Customer ID
- `companyName` - Market name (URL encoded)
- `date` - Date in YYYY-MM-DD format

**Example:**
```
GET /api/market-details/68e901a30b634680f54a5832/%E0%A4%95%E0%A4%B2%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%A3/2026-01-31
```

**Response:**
```json
{
  "success": true,
  "marketDetails": {
    "_id": "...",
    "vendorId": "...",
    "customerId": "...",
    "companyName": "कल्याण",
    "date": "2026-01-31",
    "open": "12",
    "close": "15",
    "jod": "3",
    "gameRowOpen": {...},
    "gameRowClose": {...}
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Market details not found"
}
```

---

### 3. Get Customer Market Details
**GET** `/api/market-details/customer/:customerId?date=YYYY-MM-DD`

Retrieves all market details for a specific customer, optionally filtered by date.

**Parameters:**
- `customerId` - Customer ID (path parameter)
- `date` - Optional date filter (query parameter)

**Example:**
```
GET /api/market-details/customer/68e901a30b634680f54a5832
GET /api/market-details/customer/68e901a30b634680f54a5832?date=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "marketDetails": [
    {
      "_id": "...",
      "companyName": "कल्याण",
      "date": "2026-01-31",
      "open": "12",
      "close": "15",
      ...
    },
    {
      "_id": "...",
      "companyName": "मुंबई",
      "date": "2026-01-31",
      "open": "10",
      "close": "13",
      ...
    }
  ]
}
```

---

### 4. Get Market Details by Date
**GET** `/api/market-details/date/:date`

Retrieves all market details for a specific date (for all customers and markets).

**Parameters:**
- `date` - Date in YYYY-MM-DD format

**Example:**
```
GET /api/market-details/date/2026-01-31
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "marketDetails": [
    {
      "_id": "...",
      "customerId": "...",
      "companyName": "कल्याण",
      "date": "2026-01-31",
      "open": "12",
      "close": "15",
      ...
    },
    ...
  ]
}
```

---

### 5. Delete Market Details by ID
**DELETE** `/api/market-details/:id`

Deletes market details by their MongoDB ID.

**Parameters:**
- `id` - Market details document ID

**Response:**
```json
{
  "success": true,
  "message": "Market details deleted successfully",
  "marketDetails": {...}
}
```

---

### 6. Delete Market Details by Parameters
**DELETE** `/api/market-details`

Deletes market details by customer, market, and date.

**Request Body:**
```json
{
  "customerId": "68e901a30b634680f54a5832",
  "companyName": "कल्याण",
  "date": "2026-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Market details deleted successfully",
  "marketDetails": {...}
}
```

---

### 7. Clear Market Details by Date
**DELETE** `/api/market-details/date/:date`

Deletes all market details for a specific date (useful for day change cleanup).

**Parameters:**
- `date` - Date in YYYY-MM-DD format

**Example:**
```
DELETE /api/market-details/date/2026-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 10 market details for date 2026-01-31",
  "deletedCount": 10
}
```

---

## Data Model

### MarketDetails Schema
```javascript
{
  vendorId: ObjectId,        // Reference to Vendor
  customerId: ObjectId,      // Reference to Customer
  companyName: String,       // Market name (e.g., "कल्याण")
  date: String,              // Date in YYYY-MM-DD format
  open: String,               // Open market value
  close: String,             // Close market value
  jod: String,               // Jod value
  gameRowOpen: {             // Saved ओ. (आ.) game row
    type: String,
    income: String,
    o: String,
    jod: String,
    ko: String,
    multiplier: Number,
    pan: { val1: String, val2: String, type: String },
    gun: { val1: String, val2: String },
    special: { val1: String, val2: String, type: String }
  },
  gameRowClose: {            // Saved को. (कु.) game row
    // Same structure as gameRowOpen
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- Unique compound index on: `{ vendorId, customerId, companyName, date }`
- Index on: `{ vendorId, customerId, date }`
- Index on: `{ vendorId, companyName, date }`

---

## Usage Examples

### Frontend Integration

#### Save Open Market Value
```javascript
const saveOpenMarket = async (customerId, companyName, openValue) => {
  try {
    const response = await axios.post(
      `${API_BASE_URI}/api/market-details`,
      {
        customerId,
        companyName,
        date: dayjs().format("YYYY-MM-DD"),
        open: openValue,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('Saved:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Load Market Details
```javascript
const loadMarketDetails = async (customerId, companyName) => {
  try {
    const date = dayjs().format("YYYY-MM-DD");
    const response = await axios.get(
      `${API_BASE_URI}/api/market-details/${customerId}/${encodeURIComponent(companyName)}/${date}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.marketDetails;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Not found
    }
    throw error;
  }
};
```

#### Clear Market Data for Customer
```javascript
const clearMarketData = async (customerId, companyName) => {
  try {
    await axios.delete(
      `${API_BASE_URI}/api/market-details`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          customerId,
          companyName,
          date: dayjs().format("YYYY-MM-DD"),
        },
      }
    );
    console.log('Cleared successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Error Handling

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "customerId, companyName, and date are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Market details not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error saving market details",
  "error": "Error message details"
}
```

---

## Notes

1. **Date Format**: Always use `YYYY-MM-DD` format for dates
2. **URL Encoding**: Market names with special characters (like Devanagari) should be URL encoded
3. **Upsert Logic**: POST endpoint creates or updates automatically
4. **Vendor Isolation**: All queries are automatically filtered by the logged-in vendor's ID
5. **Unique Constraint**: Only one market details record per customer+market+date combination
