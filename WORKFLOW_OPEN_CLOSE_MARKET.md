# Open/Close Market Details - Workflow Documentation

## Overview
This feature allows users to save open/close market details per customer and have them auto-fill when creating receipts. The system saves data per customer+market combination and loads it from the customer's latest receipt.

---

## 📋 Complete Workflow

### **Part 1: Saving Market Details in ShortcutTab**

#### Step 1: User Fills Market Details
1. User navigates to **Shortcuts** tab
2. Selects a **Market** (e.g., "कल्याण")
3. Selects a **Customer** from the list
4. Fills in the **Open** and **Close** market values for that customer

#### Step 2: Save Open Market Details
- User clicks **"Save Open"** button
- System saves data to `localStorage` with key: `${customerId}_${companyName}_${currentDay}`
- Example key: `"68e901a30b634680f54a5832_कल्याण_2026-01-31"`
- Data structure:
  ```javascript
  {
    "68e901a30b634680f54a5832_कल्याण_2026-01-31": {
      open: "12",
      close: "",
      gameRowOpen: {...},
      gameRowClose: {...}
    }
  }
  ```
- ✅ Checkmark appears next to "Save Open" button
- Toast notification: "Open market details saved for this customer"

#### Step 3: Save Close Market Details
- User clicks **"Save Close"** button
- Same process as Step 2, but updates the `close` field
- ✅ Checkmark appears next to "Save Close" button
- Toast notification: "Close market details saved for this customer"

#### Step 4: Save Game Rows (Optional)
- User can also save game rows for ओ. (आ.) and को. (कु.) types
- Click **"Save ओ."** or **"Save को."** buttons below respective game rows
- Data saved to same localStorage key under `gameRowOpen` and `gameRowClose`

---

### **Part 2: Auto-Filling in ReceiptForm**

#### Scenario A: Customer Selected → Receipts Already Loaded

1. **User selects customer** (via serial number or search dropdown)
   - User types serial number (e.g., "1") or searches customer name
   - `handleCustomerSelect()` is called
   - `serialNumberInput` state is updated

2. **Main useEffect triggers** (depends on: `serialNumberInput`, `customerList`, `receipts`)
   - Finds customer from `customerList`
   - Filters receipts: `receipts.filter(r => r.customerId === customer._id)`
   - Sorts receipts by date (most recent first)
   - Gets latest receipt: `customerReceipts[0]`

3. **Load open/close values**
   - Checks if `latestReceipt.openCloseValues` exists
   - If yes, sets `openCloseValues` state:
     ```javascript
     setOpenCloseValues({
       open: latestReceipt.openCloseValues.open || "",
       close: latestReceipt.openCloseValues.close || "",
       jod: latestReceipt.openCloseValues.jod || ""
     })
     ```
   - If no, sets to initial empty values

4. **Result**: Open/Close fields are auto-filled in the form

---

#### Scenario B: Customer Selected → Receipts Load Later

1. **User selects customer first**
   - Customer ID is set in `formData.customerId`
   - But `receipts` array is still empty (loading)

2. **Receipts load via API**
   - `fetchReceipts()` completes
   - `setReceipts(fetchedReceipts)` updates state

3. **Separate useEffect triggers** (depends on: `receipts`, `formData.customerId`)
   - Checks: `isEditingRef.current` is false
   - Checks: `formData.customerId` exists
   - Checks: `receipts.length > 0`
   - Filters customer receipts
   - Finds latest receipt
   - Loads open/close values

4. **Result**: Open/Close fields auto-fill once receipts are loaded

---

#### Scenario C: Receipts Load → Customer Selected Later

1. **Receipts are already loaded**
   - `receipts` array is populated
   - User then selects a customer

2. **Main useEffect triggers immediately**
   - Same flow as Scenario A
   - Values load instantly since receipts are available

---

### **Part 3: Market Selection & Game Rows**

#### When Market (Company) is Selected

1. **User selects market dropdown** (e.g., "कल्याण")
   - `handleChange()` is called with `name === "customerCompany"`
   - `formData.customerCompany` is updated

2. **Load saved game rows** (if customer is selected)
   - `loadSavedGameRows(companyName)` is called
   - Checks localStorage for key: `${customerId}_${companyName}_${currentDay}`
   - If found, loads `gameRowOpen` and `gameRowClose`
   - Updates `gameRows` state with saved data
   - Toast: "Auto-filled saved game rows for {companyName}"

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SHORTCUT TAB                             │
│                                                             │
│  1. User fills Open/Close values                           │
│  2. Clicks "Save Open" / "Save Close"                     │
│  3. Data saved to localStorage:                            │
│     Key: ${customerId}_${market}_${date}                  │
│     Value: { open, close, gameRowOpen, gameRowClose }     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ (Data persists in localStorage)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 CREATE RECEIPT FORM                         │
│                                                             │
│  1. User selects Customer                                   │
│     ├─→ Main useEffect runs                                │
│     │   ├─→ Finds customer receipts                         │
│     │   ├─→ Gets latest receipt                             │
│     │   └─→ Loads openCloseValues                           │
│     │                                                       │
│  2. User selects Market                                     │
│     ├─→ loadSavedGameRows() runs                           │
│     │   ├─→ Checks localStorage                             │
│     │   └─→ Loads saved game rows                           │
│     │                                                       │
│  3. If receipts load after customer selection:             │
│     ├─→ Separate useEffect runs                             │
│     └─→ Loads openCloseValues from latest receipt           │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Storage Structure

### localStorage Key Format
```
${customerId}_${companyName}_${YYYY-MM-DD}
```

### Example Keys
```
"68e901a30b634680f54a5832_कल्याण_2026-01-31"
"68e901a30b634680f54a5832_मुंबई_2026-01-31"
"68f1234567890abcdef123456_कल्याण_2026-01-31"
```

### Data Structure
```javascript
{
  "savedMarketData": {
    "customerId_market_date": {
      open: "12",              // Open market value
      close: "15",             // Close market value
      gameRowOpen: {          // Saved ओ. (आ.) game row
        type: "आ.",
        income: "100",
        o: "5",
        // ... other fields
      },
      gameRowClose: {         // Saved को. (कु.) game row
        type: "कु.",
        income: "200",
        // ... other fields
      }
    }
  }
}
```

---

## 🎯 Key Features

### 1. **Per-Customer Isolation**
- Each customer has their own saved market data
- Customer A's data doesn't affect Customer B
- Same market can have different values for different customers

### 2. **Per-Day Isolation**
- Data is saved per day (current date)
- When day changes, old data is cleared (auto-clear on day change)
- Format: `YYYY-MM-DD`

### 3. **Auto-Fill Priority**
1. **First Priority**: Customer's latest receipt's `openCloseValues`
2. **Second Priority**: Saved data from localStorage (for game rows)
3. **Fallback**: Empty values

### 4. **Auto-Clear on Day Change**
- System checks if current day differs from last saved day
- If day changed, clears all saved market data
- Shows toast notification: "Day changed. Market data cleared."

---

## 🔍 Edge Cases Handled

### Case 1: Customer Has No Receipts
- Open/Close fields set to empty values
- No error thrown

### Case 2: Receipt Has No openCloseValues
- Fields set to empty values
- User can manually enter values

### Case 3: Customer Selected Before Receipts Load
- Separate useEffect waits for receipts
- Once loaded, auto-fills values

### Case 4: Multiple Markets for Same Customer
- Each market has separate saved data
- Switching markets loads respective saved data

### Case 5: Day Change
- Auto-detects day change
- Clears all saved data
- User starts fresh for new day

---

## 🚀 User Experience Flow

### Typical Workflow

1. **Morning Setup (Shortcuts Tab)**
   - Open Shortcuts tab
   - For each customer:
     - Select customer
     - Select market
     - Enter open/close values
     - Click "Save Open" and "Save Close"
     - (Optional) Save game rows

2. **Creating Receipts (Receipt Form)**
   - Select customer → Open/Close auto-fills from latest receipt
   - Select market → Game rows auto-fill from saved data
   - Fill remaining form fields
   - Save receipt (which saves openCloseValues for next time)

3. **Next Day**
   - System auto-clears saved data
   - User repeats morning setup
   - Previous day's receipt data still available for reference

---

## 📝 Technical Implementation Details

### Key Functions

1. **`saveOpenMarket(companyName, customerId)`**
   - Saves open value for specific customer+market
   - Updates localStorage
   - Shows success toast

2. **`saveCloseMarket(companyName, customerId)`**
   - Saves close value for specific customer+market
   - Updates localStorage
   - Shows success toast

3. **`loadSavedGameRows(companyName)`**
   - Loads saved game rows from localStorage
   - Merges with existing game rows
   - Updates state

4. **Main useEffect (serialNumberInput)**
   - Triggers on customer selection
   - Loads pending/advance amounts
   - Loads open/close values from latest receipt

5. **Separate useEffect (receipts, customerId)**
   - Triggers when receipts load
   - Loads open/close if customer already selected

---

## ✅ Benefits

1. **Time Saving**: No need to manually enter open/close values each time
2. **Accuracy**: Reduces human error by auto-filling from latest receipt
3. **Consistency**: Each customer's data is isolated and consistent
4. **Flexibility**: Can save different values for different markets per customer
5. **Persistence**: Data persists across browser sessions (localStorage)

---

## 🔧 Troubleshooting

### Issue: Open/Close not auto-filling
**Possible Causes:**
- Customer has no receipts yet
- Latest receipt doesn't have `openCloseValues` saved
- Receipts haven't loaded yet (wait a moment)

### Issue: Saved data not loading
**Possible Causes:**
- Day has changed (data auto-cleared)
- Wrong customer selected
- Wrong market selected
- localStorage cleared manually

### Issue: Data showing for wrong customer
**Possible Causes:**
- Customer ID mismatch
- Check localStorage key format
- Verify customer selection

---

## 📌 Summary

The system provides a seamless workflow where:
1. **ShortcutTab**: Save market details per customer per day
2. **ReceiptForm**: Auto-fill from customer's latest receipt
3. **localStorage**: Persist data across sessions
4. **Auto-clear**: Fresh start each day

This ensures efficient data entry while maintaining data integrity and customer-specific isolation.
