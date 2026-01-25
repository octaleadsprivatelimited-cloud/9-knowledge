# Setup Instructions for 9knowledge News Portal

## Step 1: Create Firebase Project

1. Go to Firebase Console: https://console.firebase.google.com
2. Click **Add project** or select an existing project
3. Follow the setup wizard to create your project
4. Enable **Firestore Database** and **Firebase Storage** when prompted

## Step 2: Configure Firebase for Web

1. In Firebase Console, click the gear icon ⚙️ next to **Project Overview**
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app (you can skip Firebase Hosting for now)
6. Copy the Firebase configuration object

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

   You can find these values in Firebase Console > Project Settings > Your apps > Web app config

## Step 4: Set Up Firestore Database Collections

You need to create the following collections in Firestore:

### Collections Structure:

1. **articles** - Main articles collection
   - Fields: title, slug, excerpt, content, featured_image, featured_image_alt, category_id, author_id, status, is_featured, is_trending, published_at, scheduled_at, reading_time, view_count, meta_title, meta_description, meta_keywords, og_image, canonical_url, no_index, created_at, updated_at

2. **categories** - Article categories
   - Fields: name, slug, description, is_active, sort_order, created_at, updated_at

3. **tags** - Article tags
   - Fields: name, slug, created_at, updated_at

4. **user_roles** - User role assignments
   - Fields: user_id, role, created_at

5. **profiles** - User profiles
   - Fields: id, email, full_name, created_at

6. **ad_slots** - Advertisement slots
   - Fields: name, slot_id, position, is_active, created_at, updated_at

7. **reading_analytics** - Reading analytics (optional)
   - Fields: article_id, session_id, scroll_depth, time_on_page, completed_reading, created_at

8. **newsletter_subscribers** - Newsletter subscribers (optional)
   - Fields: email, is_active, subscribed_at

9. **firebase_pings** - Ping status tracking (optional)
   - Fields: pinged_at, status, response_time_ms, error_message

### Firestore Security Rules

Set up security rules in Firebase Console > Firestore Database > Rules:

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
    
    // User roles - authenticated read/write
    match /user_roles/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Profiles - authenticated read/write
    match /profiles/{profileId} {
      allow read, write: if request.auth != null;
    }
    
    // Other collections - adjust as needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Set Up Firebase Storage

1. Go to Firebase Console > Storage
2. Click **Get started** if you haven't enabled Storage yet
3. Start in **test mode** for development (you can secure it later)
4. Create a folder structure:
   - `media/uploads/` - For general uploads
   - `media/articles/` - For article images

### Storage Security Rules

Set up storage rules in Firebase Console > Storage > Rules:

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

## Step 6: Enable Firebase Authentication

1. Go to Firebase Console > Authentication
2. Click **Get started**
3. Enable **Email/Password** authentication method
4. Optionally enable other providers (Google, etc.)

## Step 7: Install Dependencies and Start Development Server

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Step 8: Verify Connection

1. Open your browser to http://localhost:8080
2. Open Developer Tools (F12)
3. Check the Console tab
4. You should see:
   - ✅ Firebase environment variables loaded successfully
   - ✅ Firebase initialized successfully
   - 📍 Firebase Project ID: [your-project-id]

## Troubleshooting

### Error: "Missing Firebase environment variables"
**Solution**: 
1. Make sure `.env` file is in the root directory
2. Check that all variables start with `VITE_`
3. Restart the dev server (stop and run `npm run dev` again)

### Error: "Firebase: Error (auth/configuration-not-found)"
**Solution**: 
1. Verify your Firebase config values in `.env` are correct
2. Make sure you copied the values from Firebase Console > Project Settings

### Error: "Permission denied" or Firestore rules error
**Solution**: 
1. Check your Firestore security rules in Firebase Console
2. Make sure public read access is enabled for articles and categories
3. Verify authentication is set up correctly

### Error: "Collection not found"
**Solution**: 
1. Create the required collections in Firestore Database
2. Make sure collection names match exactly (case-sensitive)
3. Add at least one document to each collection to initialize them

## Next Steps

1. Create your first category in Firestore
2. Create your first article
3. Set up user roles for admin access
4. Configure Firebase Storage for image uploads

## Important Notes

- Firestore is a NoSQL database, so the structure is more flexible than SQL
- You can add fields to documents as needed
- Indexes may be required for complex queries (Firebase will prompt you)
- Consider setting up Firebase Cloud Functions for server-side operations if needed
