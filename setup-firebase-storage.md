# Firebase Storage Setup for Product Images

## Step 1: Enable Firebase Storage
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Storage" in the left sidebar
4. Click "Get started"
5. Choose "Start in test mode" for now
6. Select your location (keep it same as Firestore)

## Step 2: Upload Images
1. Click "Upload file" or drag and drop
2. Organize in folders like: products/food/, products/electronics/, etc.

## Step 3: Get URLs
1. Click on uploaded image
2. Copy the download URL
3. It looks like: https://firebasestorage.googleapis.com/v0/b/YOUR-PROJECT.appspot.com/o/products%2Fimage.jpg?alt=media&token=TOKEN

## Step 4: Security Rules (Later)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

## Step 5: Use in Google Sheets
Just paste the full Firebase Storage URL in column F of your Google Sheet.