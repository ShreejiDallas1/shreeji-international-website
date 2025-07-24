# Square Setup Guide - Get Your Location ID

## Step 1: Get Your Production Location ID

### Method 1: Using the API (Recommended)
1. **Temporarily use production credentials to get location ID:**
   - Open `.env.local`
   - Change these lines:
   ```
   SQUARE_ACCESS_TOKEN=EAAAl0i3MYgMCJQN3CMNxYXm1PhSl_U1c6rKPEJElXCQtQ-qiyTlTg7X8L_Za2zd
   SQUARE_ENVIRONMENT=production
   ```

2. **Visit this URL in your browser:**
   ```
   http://localhost:3000/api/square/get-locations
   ```

3. **You'll see a response like:**
   ```json
   {
     "success": true,
     "locations": [
       {
         "id": "L123ABC456DEF789",
         "name": "Shreeji International",
         "address": {
           "address_line_1": "Your Address",
           "locality": "Dallas",
           "administrative_district_level_1": "TX"
         },
         "status": "ACTIVE"
       }
     ]
   }
   ```

4. **Copy the `id` field** - this is your location ID!

### Method 2: From Square Dashboard
1. Go to https://squareup.com/dashboard
2. Click on "Account & Settings" 
3. Click on "Business" 
4. Click on "Locations"
5. Your Location ID will be shown there

## Step 2: Update Your Environment File

Once you have your location ID, update `.env.local`:

```env
# Square Payment Configuration (Production)
SQUARE_APPLICATION_ID=sq0idp-azKeC9GwNrYyY7VsxOmH2A
SQUARE_ACCESS_TOKEN=EAAAl0i3MYgMCJQN3CMNxYXm1PhSl_U1c6rKPEJElXCQtQ-qiyTlTg7X8L_Za2zd
SQUARE_LOCATION_ID=YOUR_ACTUAL_LOCATION_ID_HERE
SQUARE_ENVIRONMENT=production
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-azKeC9GwNrYyY7VsxOmH2A
NEXT_PUBLIC_SQUARE_LOCATION_ID=YOUR_ACTUAL_LOCATION_ID_HERE
NEXT_PUBLIC_SQUARE_ENVIRONMENT=production
```

## Step 3: Add Products to Square

1. **Go to Square Dashboard:** https://squareup.com/dashboard
2. **Click "Items & Orders"** in the left menu
3. **Click "Items"**
4. **Click "Create Item"**
5. **Fill out the form:**
   - Item Name: e.g., "Basmati Rice 20lb"
   - Price: e.g., $25.99
   - Category: Create categories like "Rice", "Spices", "Lentils"
   - Description: Add detailed description
   - SKU: Optional but recommended
   - Track Inventory: Enable if you want inventory tracking

6. **Repeat for all your products**

## Step 4: Test the Connection

1. **Visit:** `http://localhost:3000/api/test-square`
2. **Should show:** Success with your products listed
3. **Then sync:** Go to `http://localhost:3000/admin/sync` and click "Sync Products"

## Step 5: Verify Products Show Up

1. **Visit:** `http://localhost:3000/shop`
2. **Your products should now appear!**

---

## Troubleshooting

### If you get "Access forbidden" error:
- Your location ID is wrong
- Use Method 1 above to get the correct one

### If no products show after sync:
- Check if products exist in Square dashboard
- Make sure they have prices set
- Check browser console for errors

### If sync fails:
- Check your internet connection
- Verify your Square access token is correct
- Try the test endpoint first