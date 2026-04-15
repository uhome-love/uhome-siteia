

## Plan: Fix Persistent Build Failure

**Root cause:** `Collection.tsx` and `PortoAlegrePilar.tsx` are eager-imported in `lazyPages.ts`, creating a hard compile-time dependency. The publish build environment consistently can't resolve these files, even though they exist in the sandbox. This has been failing for over a day.

**Fix:** Convert the two eager imports to lazy imports using `lazyRetry()` — the same pattern used for all 40+ other pages. This makes the dependency runtime-only, so the build succeeds even if there's a file sync delay.

### Changes

**`src/routes/lazyPages.ts`** (lines 3-6):
```typescript
// Before (eager - breaks publish build):
export { default as Index } from "../pages/Index.tsx";
export { default as Collection } from "../pages/Collection.tsx";
export { default as PortoAlegrePilar } from "../pages/PortoAlegrePilar.tsx";

// After (only Index stays eager, others become lazy):
export { default as Index } from "../pages/Index.tsx";
export const Collection = lazyRetry(() => import("../pages/Collection.tsx"));
export const PortoAlegrePilar = lazyRetry(() => import("../pages/PortoAlegrePilar.tsx"));
```

No other files need changes — `AppRoutes.tsx` already wraps everything in `<Suspense>`.

**Impact:** Slightly slower first load for `/collection` and `/imoveis-porto-alegre` (lazy chunk fetch), but eliminates the build blocker entirely. All other pages already use this pattern.

