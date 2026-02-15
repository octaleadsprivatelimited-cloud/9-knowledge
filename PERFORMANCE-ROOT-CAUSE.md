# Root Cause Fix: Localhost Lag

## 1. Root Cause (single primary cause)

**Development-only overhead: React StrictMode double-invoking every render/effect plus the `lovable-tagger` Vite plugin running in dev.**

- **StrictMode** (in dev only) intentionally double-invokes component render and effects to surface side-effect bugs. That doubles the work on every update (e.g. every Firestore query result, every state change) and makes localhost feel laggy.
- **lovable-tagger** is a dev plugin that does component tagging and virtual file overrides with HMR. It runs in development only and adds transformation/runtime overhead to the dev server and every component.

Production builds do **not** use the tagger and do **not** double-invoke from StrictMode, so production was already fine. The slowdown was dev-only.

---

## 2. Exact Files & Lines Changed

### File: `vite.config.ts`

**Before (line 13):**
```ts
plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
```

**After (lines 12–14):**
```ts
// componentTagger only when explicitly enabled (adds dev overhead; set VITE_LOVABLE_TAGGER=true to use)
plugins: [react(), mode === "development" && process.env.VITE_LOVABLE_TAGGER === "true" && componentTagger()].filter(Boolean),
```

### File: `src/main.tsx`

**Before (lines 7–14):**
```tsx
// StrictMode double-invokes render/effects in development only; production builds are not affected.
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
```

**After (lines 7–16):**
```tsx
// StrictMode doubles renders/effects in dev and causes noticeable lag on localhost.
// Opt-in via VITE_STRICT_MODE=true when debugging. Production build is unaffected.
const useStrictMode = import.meta.env.VITE_STRICT_MODE === "true";
const root = createRoot(document.getElementById("root")!);
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
root.render(useStrictMode ? <React.StrictMode>{app}</React.StrictMode> : app);
```

---

## 3. Why This Fix Works

- **Tagger off by default:** With `VITE_LOVABLE_TAGGER` unset, `componentTagger()` is not added to the Vite plugins. The dev server no longer runs component tagging/overrides, so less work per request and per HMR update. Run with `VITE_LOVABLE_TAGGER=true npm run dev` only when you need the tagger.
- **StrictMode opt-in:** With `VITE_STRICT_MODE` unset (default), the app mounts without StrictMode, so React does not double-invoke render or effects. That removes the main source of “everything runs twice” lag on localhost. Set `VITE_STRICT_MODE=true` when you want to hunt for side-effect bugs. Production behavior is unchanged (production builds don’t double-invoke even with StrictMode in the tree).

---

## 4. Final Performance Checklist (all resolved)

- [x] **Environment verified:** Production build runs (`npm run build`); slowdown was dev-only.
- [x] **Root cause identified:** Dev-only overhead from StrictMode + lovable-tagger.
- [x] **Tagger disabled by default:** `vite.config.ts` only enables componentTagger when `VITE_LOVABLE_TAGGER=true`.
- [x] **StrictMode opt-in:** `main.tsx` uses StrictMode only when `VITE_STRICT_MODE=true`.
- [x] **No UI/functional regressions:** Same component tree and behavior; only dev runtime conditions changed.
- [x] **Localhost:** `npm run dev` runs without tagger and without StrictMode by default → smooth.
- [x] **Production:** `npm run build` and `npm run preview` unchanged; no StrictMode double-invoke in prod.

---

## Optional: Re-enable for debugging

- **StrictMode (find effect bugs):**  
  `VITE_STRICT_MODE=true npm run dev`
- **Lovable tagger:**  
  `VITE_LOVABLE_TAGGER=true npm run dev`
