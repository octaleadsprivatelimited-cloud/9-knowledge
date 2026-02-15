# Performance Audit & Optimization Report

## Section 1: Project Understanding Summary

| Aspect | Details |
|--------|---------|
| **Build tool** | Vite 5 with SWC (`@vitejs/plugin-react-swc`) |
| **Framework** | React 18, TypeScript |
| **Routing** | react-router-dom v6, lazy routes with Suspense |
| **State** | React Query (TanStack Query) for server state; React Context (AuthContext) for auth |
| **Data** | Firebase (Firestore, Auth, Storage); no REST API layer |
| **Styling** | Tailwind CSS, Radix UI, shadcn/ui |
| **Heavy deps** | Firebase, TipTap (admin editor), Recharts (admin), Lucide (icons), react-helmet-async |

**Critical paths**

- **Homepage (Index):** Layout → Header, Footer, AdSlot (deferred) → LatestUpdatesStrip (6 articles) → N × CategoryArticlesSection (each fetches 4 articles by category). All category sections mount at once and fire parallel Firestore queries.
- **Article page:** Single article fetch by slug/id, related articles from latest cache, reading analytics.
- **Admin:** ArticleEditorPage loads TipTap + RichTextEditor; dashboard may load Recharts.

**Dev vs production**

- **Development:** Vite dev server, HMR, source maps (disabled in build), React StrictMode (double render/effects), `lovable-tagger` plugin. Expect slower initial load and more re-renders.
- **Production:** Single Suspense boundary for all lazy routes; Index is eager (no lazy) for fast LCP; manual chunks split react, firebase, tiptap, recharts, lucide, vendor.

---

## Section 2: Identified Performance Issues (Prioritized)

### High impact (fixed)

1. **N+1 category fetches in `useArticlesByCategory`**  
   Each article was converted with `convertToPublicArticle()`, which performed a separate `getDoc(categories, categoryId)` per article. With 5 category sections × 4 articles = up to 20 sequential category reads.  
   **Fix:** Batch-fetch all unique category IDs with `fetchCategoryMap()` and use `convertToPublicArticleWithCategoryMap()` so conversion is synchronous after one parallel batch.

2. **AuthContext value recreated every render**  
   The context `value={{ user, session, ... }}` was a new object each time, so every consumer re-rendered on any AuthProvider state change.  
   **Fix:** `useMemo` for the context value; `useCallback` for `signIn`, `signUp`, `signOut`.

3. **No memoization on list components**  
   `ArticleCard`, `CategorySection`, `LatestUpdatesStrip`, `CategoryArticlesSection` re-rendered whenever parent state changed (e.g. categories or latest articles loading).  
   **Fix:** Wrapped in `React.memo()` so they only re-render when props change.

4. **Unstable category list reference on Index/Header**  
   `sortCategoriesByDisplayOrder(...)` returned a new array every time, so memoized children still saw new `categories` reference when parent re-rendered.  
   **Fix:** `useMemo(() => sortCategoriesByDisplayOrder(...), [categoriesRaw, displayOrder])` on Index and Header.

5. **`formatRelativeDate` recreated inside ArticleCard**  
   Pure function was defined inside the component, so it was recreated every render (minor cost, but unnecessary).  
   **Fix:** Moved to `src/lib/dateUtils.ts` and imported; tree-shakeable and single allocation.

### Medium impact (fixed)

6. **Single large vendor chunk**  
   All `node_modules` except react and firebase went into one `vendor` chunk, so admin-only libs (TipTap, Recharts, Lucide) were loaded on first visit.  
   **Fix:** Manual chunks for `@tiptap`, `recharts`, `lucide-react` so they load only when admin/editor or chart-heavy routes are used.

7. **BackToTop in main bundle**  
   BackToTop is below the fold and not needed for first paint.  
   **Fix:** Lazy-load `BackToTop` with `React.lazy` and wrap in `<Suspense fallback={null}>`.

8. **Header inline handlers**  
   `onClick={() => setIsSearchOpen(true)}` etc. created new function refs every render, preventing downstream memoization from skipping re-renders.  
   **Fix:** `useCallback` for `openSearch`, `closeSearch`, `toggleMenu`, `closeMenu` and use them in JSX.

### Low impact / documented

9. **StrictMode in development**  
   Double-invocation of render and effects in dev only; production is unchanged. Documented in `main.tsx`.

10. **Index page eager load**  
    Index is the only non-lazy route so the homepage shell and data hooks load immediately. This was kept for LCP; lazy-loading Index would show a loader and delay content.

---

## Section 3: Implemented Code & Config Changes

### 3.1 Data layer: batch category fetch in `useArticlesByCategory`

**File:** `src/hooks/usePublicArticles.ts`

- **Before:** Loop over `snapshot.docs`, `await convertToPublicArticle(docSnapshot)` each (N sequential `getDoc` for categories).
- **After:** New helper `filterAndConvertArticlesByCategory(docs, limit, now)`:
  - Filter docs by published/scheduled.
  - Collect category IDs → `fetchCategoryMap(categoryIds)` (parallel `getDoc` for unique categories).
  - Map filtered docs with `convertToPublicArticleWithCategoryMap(d, categoryMap)` (no await in loop).
  - Sort and slice.
- Both the main path and the `failed-precondition` fallback use this helper.

**Why it helps:** Reduces Firestore round-trips from O(articles) to O(unique categories) per section and makes conversion synchronous after one batch, improving TTI and reducing network waterfall.

### 3.2 AuthContext: stable value and callbacks

**File:** `src/contexts/AuthContext.tsx`

- Wrapped `signIn`, `signUp`, `signOut` in `useCallback` with correct deps (`auth`, `db`, `auth`).
- Built context value object in `useMemo(..., [user, session, loading, role, isAdmin, ... callbacks])`.
- Provider uses `value={value}`.

**Why it helps:** Consumers (e.g. ProtectedRoute, admin layout) only re-render when auth state or callbacks actually change, not on every AuthProvider render.

### 3.3 Memoized components

**Files:**  
`src/components/articles/ArticleCard.tsx`, `src/components/home/CategorySection.tsx`, `src/components/home/LatestUpdatesStrip.tsx`, `src/components/home/CategoryArticlesSection.tsx`

- Replaced `export function X` with `function XComponent` + `export const X = memo(XComponent)`.
- `ArticleCard` now imports `formatRelativeDate` from `@/lib/dateUtils` instead of defining it inline.

**Why it helps:** When Index or a category page re-renders (e.g. React Query updates), list items and sections that receive the same props skip re-render, reducing render time and keeping scroll/layout stable.

### 3.4 Stable categories and callbacks (Index, Header)

**Files:** `src/pages/Index.tsx`, `src/components/layout/Header.tsx`

- **Index:** `categories = useMemo(() => sortCategoriesByDisplayOrder(categoriesRaw, displayOrder.length ? displayOrder : undefined), [categoriesRaw, displayOrder])`.
- **Header:** Same `useMemo` for categories; `openSearch`, `closeSearch`, `toggleMenu`, `closeMenu` with `useCallback`; all `onClick` handlers use these.

**Why it helps:** Stable `categories` reference lets memoized `CategoryArticlesSection` avoid re-renders when parent re-renders with same data; stable callbacks help any memoized children of Header.

### 3.5 Date util

**File:** `src/lib/dateUtils.ts` (new)

- `formatRelativeDate(dateString: string | null): string` — pure, no component dependency.

**Why it helps:** Single place for date logic, no per-render function allocation in ArticleCard.

### 3.6 Vite: manual chunks

**File:** `vite.config.ts`

- **Before:** `react-vendor`, `firebase-vendor`, `vendor` (everything else).
- **After:** Added:
  - `tiptap-vendor` for `node_modules/@tiptap`
  - `recharts-vendor` for `node_modules/recharts`
  - `lucide-vendor` for `node_modules/lucide-react`
- React chunk condition tightened to `react/` and `react-dom/` paths to avoid over-splitting.

**Why it helps:** Admin/editor and chart-heavy routes load their heavy deps on demand; repeat visits can cache smaller, route-specific chunks.

### 3.7 Lazy BackToTop

**File:** `src/components/layout/Layout.tsx`

- `const BackToTop = lazy(() => import("./BackToTop").then((m) => ({ default: m.BackToTop })))`.
- Rendered inside `<Suspense fallback={null}>`.

**Why it helps:** BackToTop is not needed for first paint or LCP; lazy-loading it slightly reduces initial JS parse/execute.

### 3.8 main.tsx

**File:** `src/main.tsx`

- Comment added: StrictMode double-invokes only in development; production builds are not affected.

---

## Section 4: Final Optimized Architecture Overview

```
main.tsx (StrictMode in dev only, comment)
  └─ HelmetProvider
      └─ App (QueryClientProvider, AuthProvider with memoized value)
          └─ BrowserRouter
              └─ Suspense (PageLoader)
                  └─ Routes
                      ├─ Index (eager) — useMemo(categories), memoized CategoryArticlesSection / LatestUpdatesStrip
                      ├─ ArticlePage (lazy)
                      ├─ CategoryPage (lazy)
                      ├─ … other public (lazy)
                      └─ Admin/* (lazy, load tiptap / recharts when visited)

Layout (every page)
  ├─ Header — useMemo(categories), useCallback(openSearch, closeSearch, toggleMenu, closeMenu)
  ├─ AdSlot (deferred 100ms)
  ├─ main { children }
  ├─ Footer
  └─ Suspense → BackToTop (lazy)

Data
  ├─ useLatestArticles(6) — batch category fetch, 10 min staleTime
  ├─ useCategories — 5 min staleTime, refetchOnWindowFocus: false
  ├─ useCategoryDisplayOrder — 5 min staleTime
  └─ useArticlesByCategory(slug, 4) — batch category fetch via filterAndConvertArticlesByCategory, 5 min staleTime
```

**Bundle strategy**

- **react-vendor:** react, react-dom, react-router.
- **firebase-vendor:** Firebase SDK.
- **tiptap-vendor:** TipTap (admin editor).
- **recharts-vendor:** Recharts (admin dashboard).
- **lucide-vendor:** Lucide icons.
- **vendor:** Remaining node_modules.
- **Route chunks:** One per lazy route (ArticlePage, CategoryPage, admin pages, etc.).

---

## Section 5: Post-Optimization Verification Checklist

- [x] **Batch category fetch** — `useArticlesByCategory` and fallback path use `filterAndConvertArticlesByCategory` + `fetchCategoryMap`; no sequential `convertToPublicArticle` in a loop.
- [x] **AuthContext** — Value is `useMemo`’d; `signIn`, `signUp`, `signOut` are `useCallback`’d.
- [x] **Memoized components** — `ArticleCard`, `CategorySection`, `LatestUpdatesStrip`, `CategoryArticlesSection` exported as `memo(...)`.
- [x] **Stable categories** — Index and Header use `useMemo` for `sortCategoriesByDisplayOrder` result.
- [x] **Stable Header handlers** — `openSearch`, `closeSearch`, `toggleMenu`, `closeMenu` are `useCallback`’d and used in JSX.
- [x] **formatRelativeDate** — In `src/lib/dateUtils.ts`; ArticleCard imports it.
- [x] **Vite manualChunks** — tiptap, recharts, lucide-react split into separate chunks.
- [x] **BackToTop** — Lazy-loaded with Suspense in Layout.
- [x] **No regressions** — Same UX: category order, article by slug/id, sitemap, search, translate, ads deferred, SEO/keywords.
- [ ] **Measure in production** — Run `npm run build && npm run preview`, then:
  - Lighthouse (Performance, first load and route change).
  - React DevTools Profiler: record homepage load and scroll; confirm fewer commits and shorter render times for list components when data is unchanged.
- [ ] **Optional** — Add virtualization (e.g. react-window) for admin Articles list or Category page if article count grows large (50+).

---

## Expected Improvements

| Metric | Before (typical) | After (expected) |
|--------|-------------------|------------------|
| Homepage Firestore reads | 1 + 1 + 6 + (5 × 4) category fetches ≈ 28+ | 1 + 1 + 6 + (5 × 1 batch) ≈ 13 (fewer round-trips, parallel batches) |
| Auth consumer re-renders | Every AuthProvider render | Only when auth state or callbacks change |
| List re-renders on data load | All cards/sections re-render | Memoized; only when props change |
| Initial JS (production) | One large vendor chunk | Smaller initial + on-demand tiptap/recharts/lucide |
| LCP / TTI | Blocked by many sequential reads | Improved due to batched reads and less main-thread work |

**Lighthouse:** Expect better Performance score from reduced main-thread work and smaller initial bundle; largest contentful paint may improve from faster data and deferred ads.  
**React Profiler:** Fewer component commits and shorter render phases for Index and category lists after these optimizations.
