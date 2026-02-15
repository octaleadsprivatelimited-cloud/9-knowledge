# 🔥 Firestore Indexes Setup Guide

## Issue

You're seeing these errors in the console:

```
Categories: orderBy failed, trying without orderBy: The query requires an index.
Latest articles: orderBy failed, trying without orderBy: The query requires an index.
```

These happen because **Firestore requires composite indexes** for queries that filter and sort on multiple fields.

---

## Quick Fix - Create Indexes Automatically

### Method 1: Click the Links in Console (Easiest!)

When you see the error in the browser console, it includes a direct link to create the index:

**Example Error:**
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/knowledge-ffd1f/firestore/...
```

**Steps:**
1. Click the link in the console
2. Firebase Console opens
3. Click "Create Index"
4. Wait 2-5 minutes for index to build
5. Refresh your site - error gone! ✅

---

## Method 2: Create Indexes Manually

If the links don't work, create indexes manually:

### Index 1: Categories Query

**Collection:** `categories`
**Fields to Index:**
1. `is_active` - Ascending
2. `sort_order` - Ascending
3. `__name__` - Ascending

**Steps:**
1. Go to: https://console.firebase.google.com/
2. Select your project: `knowledge-ffd1f`
3. Click "Firestore Database" in left menu
4. Click "Indexes" tab
5. Click "Create Index"
6. Fill in:
   - Collection ID: `categories`
   - Add fields:
     - Field: `is_active`, Order: `Ascending`
     - Field: `sort_order`, Order: `Ascending`
     - Field: `__name__`, Order: `Ascending`
7. Click "Create"
8. Wait 2-5 minutes

### Index 2: Articles (Latest) Query

**Collection:** `articles`
**Fields to Index:**
1. `status` - Ascending
2. `published_at` - Descending
3. `__name__` - Descending

**Steps:**
1. In Firestore Database → Indexes
2. Click "Create Index"
3. Fill in:
   - Collection ID: `articles`
   - Add fields:
     - Field: `status`, Order: `Ascending`
     - Field: `published_at`, Order: `Descending`
     - Field: `__name__`, Order: `Descending`
4. Click "Create"
5. Wait 2-5 minutes

### Index 3: Articles (Category) Query

**Collection:** `articles`
**Fields to Index:**
1. `status` - Ascending
2. `category` - Ascending
3. `published_at` - Descending
4. `__name__` - Descending

**Steps:**
1. In Firestore Database → Indexes
2. Click "Create Index"
3. Fill in:
   - Collection ID: `articles`
   - Add fields:
     - Field: `status`, Order: `Ascending`
     - Field: `category`, Order: `Ascending`
     - Field: `published_at`, Order: `Descending`
     - Field: `__name__`, Order: `Descending`
4. Click "Create"
5. Wait 2-5 minutes

---

## Why Are Indexes Needed?

### Firestore Query Limitations:

**Simple Query (No Index Needed):**
```javascript
// Just one field
articles.where('status', '==', 'published')
```

**Complex Query (Index Required):**
```javascript
// Multiple fields + sorting
articles
  .where('status', '==', 'published')
  .orderBy('published_at', 'desc')
```

Firestore needs a **composite index** to efficiently run queries that:
- Filter on multiple fields
- Filter and sort
- Sort on multiple fields

---

## Visual Guide

### Creating an Index:

```
Firebase Console
    ↓
Firestore Database
    ↓
Indexes Tab
    ↓
[+ Create Index] Button
    ↓
Fill Form:
┌────────────────────────────┐
│ Collection ID: articles    │
│                            │
│ Fields:                    │
│ [status] [Ascending]       │
│ [published_at] [Descending]│
│ [__name__] [Descending]    │
│                            │
│ [Create Index] Button      │
└────────────────────────────┘
    ↓
Building... (2-5 minutes)
    ↓
✅ Index Created!
```

---

## Index Status

### Check Index Status:

1. Go to Firestore Database → Indexes
2. Look at Status column:
   - 🟡 **Building** - Wait a few more minutes
   - 🟢 **Enabled** - Ready to use ✅
   - 🔴 **Error** - Something went wrong, recreate

### Building Time:

- **Small database** (< 100 docs): 1-2 minutes
- **Medium database** (100-1000 docs): 2-5 minutes
- **Large database** (1000+ docs): 5-15 minutes

---

## Testing

### After Creating Indexes:

**1. Wait for Build to Complete**
- Check Firestore → Indexes
- All should show "Enabled" status

**2. Refresh Your Site**
- Hard refresh: `Ctrl + Shift + R`
- Open console (F12)

**3. Check Console**
- Should NOT see index errors ✅
- Should see: "✅ Firebase Analytics initialized"

**4. Verify Queries Work**
- Homepage loads articles ✅
- Categories display ✅
- Sorting works ✅
- No errors ✅

---

## All Required Indexes

Here's a complete list of indexes your app needs:

### 1. Categories - Active Sorting
```
Collection: categories
Fields:
  - is_active (Ascending)
  - sort_order (Ascending)
  - __name__ (Ascending)
```

### 2. Articles - Latest Published
```
Collection: articles
Fields:
  - status (Ascending)
  - published_at (Descending)
  - __name__ (Descending)
```

### 3. Articles - By Category
```
Collection: articles
Fields:
  - status (Ascending)
  - category (Ascending)
  - published_at (Descending)
  - __name__ (Descending)
```

### 4. Articles - By Tag (If using tags)
```
Collection: articles
Fields:
  - status (Ascending)
  - tags (Array-contains)
  - published_at (Descending)
  - __name__ (Descending)
```

---

## Quick Commands (Firebase CLI)

### If you prefer command line:

**1. Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

**2. Login:**
```bash
firebase login
```

**3. Deploy Indexes:**

Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "categories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "sort_order", "order": "ASCENDING" },
        { "fieldPath": "__name__", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "articles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "published_at", "order": "DESCENDING" },
        { "fieldPath": "__name__", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "articles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "published_at", "order": "DESCENDING" },
        { "fieldPath": "__name__", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**4. Deploy:**
```bash
firebase deploy --only firestore:indexes
```

---

## Troubleshooting

### Issue: Index stuck at "Building"

**Solution:**
- Wait 15 minutes
- If still building, delete and recreate
- Check Firestore usage limits

### Issue: Index creation fails

**Solution:**
- Check field names match exactly
- Verify collection name is correct
- Make sure you have admin permissions

### Issue: Still seeing errors after creating index

**Solution:**
1. Check index status is "Enabled"
2. Hard refresh browser (`Ctrl + Shift + R`)
3. Clear browser cache
4. Wait a few more minutes

### Issue: "Permission denied" when creating index

**Solution:**
- Make sure you're logged in as project owner
- Check Firebase project permissions
- Try using Firebase CLI instead

---

## Performance Impact

### Before Indexes:
- ⏱️ Queries: Slow (full collection scan)
- 💰 Cost: Higher (more reads)
- ⚠️ Errors: "Index required" warnings

### After Indexes:
- ⚡ Queries: Fast (index lookup)
- 💰 Cost: Lower (efficient reads)
- ✅ Errors: None

---

## Best Practices

### 1. Create Indexes Early
- Set up indexes during development
- Don't wait for production

### 2. Use Console Links
- Easiest way to create correct indexes
- Automatically fills in all fields

### 3. Monitor Index Usage
- Check Firestore usage stats
- Delete unused indexes

### 4. Version Control
- Keep `firestore.indexes.json` in git
- Easy to recreate if needed

---

## Summary

### Quick Steps:

1. ✅ See error in console
2. ✅ Click the link in error message
3. ✅ Click "Create Index" in Firebase Console
4. ✅ Wait 2-5 minutes
5. ✅ Refresh your site
6. ✅ Error gone!

### Required Indexes:

- ✅ Categories (is_active, sort_order)
- ✅ Articles (status, published_at)
- ✅ Articles (status, category, published_at)

### Time Investment:

- Creating all indexes: 5 minutes
- Waiting for build: 5-10 minutes
- **Total: ~15 minutes** ⏱️

### Result:

- ✅ No more console errors
- ✅ Faster query performance
- ✅ Lower Firebase costs
- ✅ Professional app

---

**Date:** February 15, 2026  
**Status:** Setup Required  
**Time Needed:** ~15 minutes  
**Impact:** Critical for production

Create these indexes now for a smooth-running site! 🚀
