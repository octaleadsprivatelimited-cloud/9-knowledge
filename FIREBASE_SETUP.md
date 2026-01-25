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

### 4. Set Up Firestore Security Rules

Go to **Firestore Database** > **Rules** and use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Articles - public read, authenticated write
    match /articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Categories - public read, authenticated write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Tags - public read, authenticated write
    match /tags/{tagId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Media/Images - public read, authenticated write
    match /media/{mediaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User roles - authenticated users can read their own role
    match /user_roles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Profiles - authenticated users can read/write their own profile
    match /profiles/{profileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == profileId;
    }
    
    // Other collections - adjust as needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: The `media` collection stores image metadata. Actual image files are stored in Firebase Storage, but all metadata (URL, path, size, etc.) is tracked in Firestore for better querying and management.

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
