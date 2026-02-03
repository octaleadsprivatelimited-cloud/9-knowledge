# Firebase Setup Complete! ✅

Your Firebase configuration has been successfully set up with the following credentials:

- **Project ID**: knowledge-ffd1f
- **Auth Domain**: knowledge-ffd1f.firebaseapp.com
- **Storage Bucket**: knowledge-ffd1f.firebasestorage.app

## Next Steps: Enable Firebase Authentication

To enable admin panel authentication, follow these steps:

### 1. Enable Email/Password Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **knowledge-ffd1f**
3. Click on **Authentication** in the left sidebar
4. Click **Get started** (if you haven't enabled it yet)
5. Go to the **Sign-in method** tab
6. Click on **Email/Password**
7. Enable the **Email/Password** toggle
8. Click **Save**

### 2. Create Your First Admin User

You have two options:

#### Option A: Create via Firebase Console (Recommended for first admin)

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **Add user**
3. Enter an email and password
4. Click **Add user**
5. Copy the **User UID** (you'll need this for step 3)

#### Option B: Create via Admin Panel (After first admin is set up)

1. Use the admin panel's user creation feature at `/admin/users`
2. This will automatically create the user and assign a role

### 3. Set Up Admin Role in Firestore

1. Go to **Firestore Database** in Firebase Console
2. Create a collection called **user_roles** (if it doesn't exist)
3. Create a document with:
   - **Document ID**: The User UID from step 2
   - **Field**: `role` (type: string)
   - **Value**: `super_admin` (or `editor`, `author`)

Example document structure:
```
Collection: user_roles
Document ID: [User UID]
Fields:
  - role: "super_admin"
  - created_at: "2025-01-25T..."
```

### 4. Set Up Firestore Security Rules (required for view tracking)

**Important:** View tracking only works if Firestore rules allow **unauthenticated** writes for:
- `reading_analytics` – create (to log a view)
- `articles/{id}` – update **only** the `view_count` field

Go to **Firestore Database** > **Rules** in Firebase Console and replace your rules with the contents of the project file **`firestore.rules`**, or paste the rules below. Then click **Publish**.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Articles - public read; auth full write; anyone can update ONLY view_count (for tracking)
    match /articles/{articleId} {
      allow read: if true;
      allow create, delete: if request.auth != null;
      allow update: if request.auth != null
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['view_count']);
    }
    // Reading analytics - anyone can create (public view tracking)
    match /reading_analytics/{docId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    // Categories, tags, media - public read, authenticated write
    match /categories/{categoryId} { allow read: if true; allow write: if request.auth != null; }
    match /tags/{tagId} { allow read: if true; allow write: if request.auth != null; }
    match /media/{mediaId} { allow read: if true; allow write: if request.auth != null; }
    // User roles - read own; super_admin write
    match /user_roles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'super_admin';
    }
    match /profiles/{profileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == profileId;
    }
    match /ad_slots/{docId} { allow read: if true; allow write: if request.auth != null; }
    match /newsletter_subscribers/{docId} { allow read, write: if request.auth != null; }
    match /{document=**} { allow read, write: if request.auth != null; }
  }
}
```

**If view tracking doesn’t work after deploying:**  
1. In Firebase Console go to **Firestore** > **Rules** and ensure the rules above (especially `articles` and `reading_analytics`) are published.  
2. In your hosting (Vercel/Netlify/etc.) set the same **VITE_FIREBASE_*** env vars as in `.env` so the deployed app uses the correct project.

**Note**: The `media` collection stores image metadata. Actual image files are stored in Firebase Storage.

### 5. Set Up Storage Security Rules

Go to **Storage** > **Rules** and use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Media folder - public read, authenticated write
    match /media/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Important**: Images are stored in Firebase Storage, but metadata is tracked in Firestore's `media` collection. This allows for:
- Better querying and filtering
- Search functionality
- Tracking uploader information
- Easier management through Firestore console

### 6. Restart Your Development Server

After completing the above steps:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 7. Test Admin Login

1. Navigate to `http://localhost:8080/admin/login`
2. Enter the email and password you created
3. You should be redirected to the admin dashboard

## Firestore Media Collection

Images are now managed through Firestore! Here's how it works:

### How It Works

1. **File Storage**: Actual image files are stored in Firebase Storage (efficient for large files)
2. **Metadata Storage**: Image metadata is stored in Firestore `media` collection (for querying/searching)

### Media Collection Structure

The `media` collection is automatically created when you upload images. Each document contains:

```javascript
{
  name: "image-name.jpg",           // Original filename
  url: "https://...",                // Public URL from Storage
  path: "uploads/image-name.jpg",    // Storage path
  folder: "uploads",                 // Folder name (uploads/articles)
  size: 123456,                      // File size in bytes
  contentType: "image/jpeg",         // MIME type
  uploadedBy: "user-id",             // User ID who uploaded
  createdAt: Timestamp,              // Upload timestamp
  updatedAt: Timestamp               // Last update timestamp
}
```

### Benefits

- ✅ **Queryable**: Filter images by folder, size, uploader, etc.
- ✅ **Searchable**: Search images by name through Firestore
- ✅ **Trackable**: Know who uploaded what and when
- ✅ **Manageable**: View and manage all images in Firestore console
- ✅ **Efficient**: Large files still stored in Storage, metadata in Firestore

### No Manual Setup Required

The `media` collection is created automatically when you upload your first image through the admin panel at `/admin/media`.

## Role Hierarchy

- **super_admin**: Full access to all admin features
- **editor**: Can edit articles, categories, tags
- **author**: Can create and edit their own articles
- **viewer**: Read-only access (default for new users)

## Troubleshooting

### "Firebase: Error (auth/user-not-found)"
- Make sure you've created the user in Firebase Authentication
- Verify the email is correct

### "Access Denied" after login
- Check that you've created a `user_roles` document in Firestore
- Verify the role field is set correctly (super_admin, editor, or author)

### "Permission denied" errors
- Check your Firestore security rules
- Make sure the rules allow authenticated users to read/write

### View tracking not working after deploying / connecting domain
1. **Firestore rules** – In Firebase Console go to **Firestore** > **Rules**. You must allow unauthenticated **create** on `reading_analytics` and unauthenticated **update** on `articles` (only `view_count`). Use the rules from **firestore.rules** in this project (see section 4 above).
2. **Env vars in production** – In your hosting (Vercel, Netlify, etc.) add the same variables as in `.env`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` (and optionally `VITE_FIREBASE_MEASUREMENT_ID`). Without these, the deployed app cannot talk to Firebase and views won’t be tracked.
3. **Authorized domains** – In Firebase Console go to **Authentication** > **Settings** > **Authorized domains** and add your production domain (e.g. `yourdomain.com`).

### Still seeing blank page?
- Check browser console (F12) for errors
- Verify `.env` file has all Firebase credentials
- Restart the dev server after creating `.env`

## Your Firebase Configuration

All credentials have been saved to `.env` file. The app is now configured to use:
- ✅ Firebase Authentication (Email/Password)
- ✅ Firestore Database (with media collection for images)
- ✅ Firebase Storage (for actual image files)
- ✅ Firebase Analytics

**New Feature**: Images are now tracked in Firestore! Upload an image through the admin panel and check the `media` collection in Firestore to see the metadata.

You're all set! 🎉
