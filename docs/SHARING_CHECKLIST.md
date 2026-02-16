# Article sharing: show actual image and description

When someone shares an article link (WhatsApp, Facebook, X, LinkedIn), the preview must show the **article’s image** and **article’s description**, not the site default.

## What the app does

1. **Crawlers** (WhatsApp, Facebook, etc.) that open `/article/ARTICLE_ID` are sent to the server endpoint `/api/og?id=ARTICLE_ID`.
2. The server loads the article from Firestore and returns HTML with:
   - **og:image** = article’s `featured_image` or `og_image` (actual image URL)
   - **og:description** = article’s `excerpt` or `meta_description` or first 200 chars of `content`
   - **og:title** = article’s title  
   Default image/description are used **only** when the article is missing or has no image/description.

## Your checklist (do these 3 things)

### 1. Set Firebase on Vercel

So the server can read the article from Firestore:

- Vercel → your project → **Settings** → **Environment Variables**
- Add **`FIREBASE_SERVICE_ACCOUNT_JSON`**
- Value = **entire contents** of your Firebase service account JSON file (the one from Firebase Console → Project settings → Service accounts → Generate new private key)
- Save and **redeploy** the project

Without this, the server cannot load the article and will always return the default image and description.

### 2. Make sure the article has image and text

In the **admin** for each article:

- **Featured image**: set a valid image URL (e.g. from your uploads or Firebase Storage). It must be a **public HTTPS** URL.
- **Excerpt** or **Meta description**: fill at least one so the share preview has a short description.

### 3. Test the share URL

After deploy:

1. Open in a browser:  
   `https://YOUR-DOMAIN.com/api/og?id=REAL_ARTICLE_ID`  
   (use a real article ID from your site, e.g. from the article page URL `/article/xyz` → id is `xyz`).

2. You should see:
   - The **article title**
   - The **article description** (excerpt/meta description)
   - In the page source (View Source), **og:image** should be the article’s image URL, not the default image.

3. If that page shows the correct title, description, and image, then sharing the article link will show them too (after platforms refresh their cache, e.g. Facebook “Scrape Again” or sharing in a new chat).

## If it still shows default

- Confirm **FIREBASE_SERVICE_ACCOUNT_JSON** is set on Vercel and you **redeployed** after adding it.
- Confirm the **article ID** in the shared URL is correct (same as in your app).
- Confirm the article in Firestore has **status: published** and has **featured_image** (or **og_image**) and **excerpt** (or **meta_description** or **content**) set.
