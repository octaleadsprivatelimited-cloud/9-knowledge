# Firebase Admin SDK on Vercel (for OG / social preview)

The `/api/og` and `/api/article/[id]` endpoints use the **Firebase Admin SDK** when credentials are set, so article data (title, description, featured image) is fetched on the server for social sharing previews.

## Setup (one-time)

### 1. Get your service account JSON

You already have a file like `knowledge-ffd1f-firebase-adminsdk-fbsvc-e298b0d6bc.json` from Firebase Console:

- Firebase Console → Project Settings (gear) → **Service accounts** → **Generate new private key** (or use the file you downloaded).

**Important:** Do **not** commit this file to git. It is already in `.gitignore` (`*-firebase-adminsdk-*.json`).

### 2. Add the JSON to Vercel

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. Add a new variable:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value:** Paste the **entire contents** of your service account JSON file (all in one line is fine; Vercel accepts multiline too).
   - **Environments:** Production (and Preview if you want OG preview in preview deployments).
3. Save and **redeploy** the project so the new variable is available.

### 3. Verify

After redeploy:

- Open: `https://your-domain.com/api/og?id=AN_EXISTING_ARTICLE_ID`
- You should see HTML with the **article title**, **description**, and **og:image** URL from Firestore (not the default site fallback).

If you still see the default title/description/image, check:

- The env var name is exactly `FIREBASE_SERVICE_ACCOUNT_JSON`.
- The value is valid JSON (same as in your `.json` file).
- The article ID exists in Firestore and the document has `status: 'published'` and a `featured_image` or `og_image` URL.

## Fallback (no Admin SDK)

If `FIREBASE_SERVICE_ACCOUNT_JSON` is not set, the API uses the **Firebase client SDK** with your existing `VITE_FIREBASE_*` (or `FIREBASE_*`) env vars. That only works if your Firestore rules allow unauthenticated read for the articles you need; otherwise set the Admin JSON as above.

## Security

- Never commit the service account JSON file or put its contents in code.
- Restrict the service account in Google Cloud IAM to only the permissions you need (e.g. Firestore read).
