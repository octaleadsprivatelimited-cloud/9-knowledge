# 9knowledge – Complete Features List (Website + Admin Panel)

This document lists **all features** on the website and in the admin panel. Nothing is omitted.

---

## Public website

### Homepage (`/`)
- **Latest updates strip** – Horizontal strip of latest articles (6) with images and links.
- **Category sections** – Sections for each category (News, National News, Business, Entertainment, Life Style, etc.) in **display order** (configurable in admin).
- **Category article cards** – Per-category article lists with “View all” links.
- **SEO** – Website + Organization JSON-LD structured data; Helmet meta (title, description, og, canonical).
- **Google Translate** – Re-applied when homepage content loads (for dynamic content).

### Article page (`/article/:id` and `/article/:id/:slug`)
- **Article content** – Title, excerpt, published date, reading time, view count.
- **Featured image** – With alt text.
- **Embedded video** – Optional YouTube-style `video_url` rendered as iframe.
- **Rich content** – HTML content with prose styling (headings, lists, blockquotes, images).
- **Telugu / English** – Optional **Telugu version** (`telugu_content`); toggle “Original” vs “తెలుగు” (desktop sidebar + mobile button).
- **Google Translate** – “Translate to English” / “Read in Telugu” prompt; integration with Google Translate widget.
- **Breadcrumbs** – Home → Category → Article (compact nav bar).
- **Category badge** – Links to category page.
- **Social share** – Twitter, Facebook, LinkedIn, WhatsApp, Copy link (vertical on desktop, horizontal on mobile).
- **Reading progress bar** – Top-of-page progress indicator.
- **Related articles** – Up to 3 from same category (from latest articles).
- **In-article ad slot** – Configurable ad position within article body.
- **SEO** – Article + Breadcrumb JSON-LD; meta title/description/keywords; Helmet.
- **Reading analytics** – View/reading tracked in Firestore (`reading_analytics`).

### Category page (`/category/:slug`)
- **Category hero** – Name and description.
- **Article list** – Articles in that category (cards with image, title, excerpt, date, etc.).
- **Pagination or “load more”** – If implemented in `usePublicArticles` / list.

### Tag page (`/tag/:slug`)
- **Tag name** – Display.
- **Articles** – Articles that have that tag.

### Static / legal pages
- **About** (`/about`) – About the site.
- **Contact** (`/contact`) – Contact info (email, contact form UI).
- **Privacy** (`/privacy`) – Privacy policy.
- **Terms** (`/terms`) – Terms of use.
- **Disclaimer** (`/disclaimer`) – Disclaimer.

### Sitemap
- **Sitemap** (`/sitemap.xml`) – Served by **server API** `/api/sitemap`: static pages + categories + tags + published articles (from Firestore). XML for crawlers; no client-only dependency.

### Layout (all public pages)
- **Header** – Logo, main nav (categories, first 8), **Google Translate** widget, **Search** (opens modal), mobile hamburger menu.
- **Search modal** – Full-text search (Ctrl/Cmd+K); results link to articles.
- **Header ad slot** – Optional ad below header (deferred so it doesn’t block LCP).
- **Footer ad slot** – Optional ad above footer.
- **Footer** – Categories, About/Contact/Privacy/Terms, Sitemap, contact email, **social links** (Twitter, Facebook, LinkedIn, Instagram from Settings), partner link (e.g. Octaleads).
- **Back to top** – Button to scroll to top (lazy-loaded).

### Ads (public)
- **Ad slots** – Positions: header, footer, sidebar, in-article, between-posts. Fetched from Firestore `ad_slots`; rendered by `AdSlot` component (deferred after first paint).

### SEO & social sharing (server-side)
- **Crawler detection** – Middleware detects WhatsApp, Facebook, Twitter, LinkedIn, etc. and rewrites `/article/*` to `/api/og`.
- **`/api/og`** – Returns minimal HTML with **og:title, og:description, og:image (HTTPS), og:url, og:type=article** and Twitter meta so link previews show correct image and description.
- **`/api/article-page`** – Serves full SPA HTML for `/article/*` with **article meta injected in `<head>`** (so “View source” and crawlers see correct meta); image normalized to absolute HTTPS; fallback to site defaults if article not found.
- **Configurable site URL** – `VITE_SITE_URL` / `SITE_URL` for correct `og:url` in production.

### Other public behaviour
- **404** – NotFound page for unknown routes.
- **Scroll to top** – On route change (ScrollToTop component).
- **Lazy loading** – All route components lazy-loaded; shared loading spinner.
- **React Query** – Caching (e.g. 10 min stale, 30 min gc) for articles, categories, settings, etc.

---

## Admin panel

### Auth
- **Login** (`/admin/login`) – Email/password sign-in (Firebase Auth).
- **Protected routes** – All admin routes except login require auth; redirect to `/admin/login` if not signed in.
- **Role-based access** – **Super admin** required for: Settings, Users, Ads, Seed Articles; other roles see Dashboard, Articles, Categories, Tags, Media.

### Dashboard (`/admin`)
- **Stats cards** – Total articles, published count, categories count (from `useAnalytics`).
- **Views overview** – Area chart of **daily page views** (last 7 days) from analytics.
- **Content by category** – Pie chart (sample or from analytics).
- **Recent articles** – Last 5 with title, category, view count, status badge; links to edit.
- **Quick actions** – Links: New Article, Categories, Media.
- **+ New Article** badge – In header.

### Articles (`/admin/articles`, `/admin/articles/:id`)
- **List** – Table of articles: title, category, status, views, actions (edit, delete/view).
- **New article** – `/admin/articles/new`.
- **Editor** – Single form with:
  - **Content**: Title, slug (auto from title for new), excerpt, **Rich text** (TipTap) for main content, **Telugu content** (optional rich text).
  - **Media**: Featured image (upload or URL), featured image alt, **video URL** (YouTube-style).
  - **Category** – Dropdown from Firestore categories.
  - **Status** – Draft, Published, Scheduled, Archived.
  - **Scheduled at** – Datetime for scheduled publish.
  - **Flags** – Is featured, Is trending.
  - **SEO**: Meta title, meta description, meta keywords, **og_image**, canonical URL, no_index.
  - **Actions** – Save as draft, Publish, Schedule; Preview (open article in new tab); Back to list.
- **Autosave** – Draft saved to localStorage (debounced); “Draft restored” on return.
- **Tabs** – e.g. Content vs SEO for layout.

### Categories (`/admin/categories`)
- **List** – Table: name, slug, color, active, sort order, image, actions.
- **Add/Edit dialog** – Name, slug, description, **color**, is_active, sort_order, **image_url** (upload).
- **Display order** – **Drag-and-drop or up/down** to set category order (stored in `category_display_order`); used on homepage and header.
- **Delete** – With confirmation.

### Tags (`/admin/tags`)
- **List** – All tags with name, slug.
- **Create** – Name + auto slug.
- **Delete** – With confirmation.

### Media (`/admin/media`)
- **Library** – Grid/list view of uploaded images (from Firebase Storage + Firestore index).
- **Upload** – Upload new images (stored in Storage; metadata in Firestore).
- **Search** – Search by name.
- **Type filter** – e.g. all / image.
- **Copy URL** – Copy image URL to clipboard.
- **Delete** – Remove from Storage + Firestore.
- **Image upload component** – Reused in Articles and Categories for featured/og images.

### Ads (`/admin/ads`) – *Super admin only*
- **Ad slots list** – Name, slot_id, position, active, actions.
- **Add/Edit slot** – Name, slot_id (e.g. ad code id), **position** (header, sidebar, in-article, footer, between-posts), is_active.
- **Delete** – With confirmation.

### Users (`/admin/users`) – *Super admin only*
- **List** – All users (from Firestore `profiles` + `user_roles`): email/name, role, created.
- **Create user** – Email, password, full name, **role** (super_admin, editor, author); creates Firebase Auth user + profile + role in `user_roles`.
- **Role display** – Badge per user.

### Settings (`/admin/settings`) – *Super admin only*
- **Tabs**: General, SEO, Social.
- **General** – Site name, description, URL, logo, favicon, contact email, support email (UI; persistence may be partial).
- **SEO** – Default meta title/description, Google Analytics ID, Search Console, Facebook Pixel.
- **Social** – Twitter, Facebook, LinkedIn, Instagram, YouTube URLs; **saved to Firestore** `settings` doc and used in **Footer** social links.

### Seed articles (`/admin/seed-articles`) – *Super admin only*
- **Seed tool** – One-click to create **3 sample articles per active category** (via `seedArticles()`).
- **Result** – Success/error message; counts (categories processed, articles created).
- **Refresh cache** – Button to invalidate article queries so new articles show without full reload.

### Admin layout
- **Sidebar** – Dashboard, Articles, Categories, Tags, Media, Settings (and Users, Ads, Seed Articles if super admin); Sign out.
- **Mobile** – Hamburger to open/close sidebar.
- **Branding** – “9knowledge” link to dashboard.

---

## Backend / API (Vercel serverless)

- **`/api/og`** – GET `?id=...` or `?slug=...`; returns HTML with article og/twitter meta; used by middleware for crawlers.
- **`/api/article-page`** – GET `?path=id` or `path=id/slug`; returns full SPA HTML with article (or site) meta in `<head>`; used by Vercel rewrite for `/article/*`.
- **`/api/article/[id]`** – GET by article id; same article fetch + meta logic as og (alternate endpoint).
- **`/api/sitemap`** – GET; returns **sitemap XML** (static pages + categories + tags + published articles from Firestore); **Vercel rewrite** sends `/sitemap.xml` here.

---

## Firebase / data

- **Collections**: `articles`, `categories`, `tags`, `user_roles`, `profiles`, `settings`, `ad_slots`, `reading_analytics`, `newsletter_subscribers` (count used in analytics), `firebase_pings` (optional health).
- **Storage** – Images for articles, categories, media library.
- **Auth** – Email/password; custom claims or `user_roles` for super_admin / editor / author.

---

## Build / deployment

- **Vite** – Build; `vite build && node scripts/generate-article-template.js` for article-page template.
- **Vercel** – Rewrites: `/sitemap.xml` → `/api/sitemap`; `/article/:path*` → `/api/article-page?path=:path`; catch-all → `index.html`. Middleware runs first (crawler rewrite to `/api/og`).
- **Env** – `FIREBASE_SERVICE_ACCOUNT_JSON` (or separate Firebase env vars) for server APIs; `VITE_SITE_URL` / `SITE_URL` for og:url; Vite env for client Firebase.

---

## Summary table

| Area            | Features |
|-----------------|----------|
| **Home**        | Latest strip, category sections in order, SEO, Translate |
| **Article**     | Content, featured image, video, Telugu toggle, Translate, share, reading progress, related, breadcrumbs, ads, analytics, SEO |
| **Category/Tag**| List pages with article cards |
| **Static**      | About, Contact, Privacy, Terms, Disclaimer |
| **Layout**      | Header (nav, Translate, search), header/footer ads, footer (categories, links, social), back to top |
| **Search**      | Modal, Ctrl+K, links to articles |
| **Admin**       | Login, Dashboard (stats, charts, recent, quick actions), Articles (CRUD, rich editor, Telugu, SEO, schedule, autosave), Categories (CRUD, order, color, image), Tags (CRUD), Media (upload, list, search, delete), Ads (slots by position), Users (list, create, roles), Settings (general, SEO, social), Seed articles |
| **API**         | og, article-page, article/[id], sitemap |
| **SEO/Social**  | Crawler rewrite, server meta, sitemap.xml, configurable site URL |

This is the full feature set of the website and admin panel as implemented in the codebase.
