import { lazy, type ComponentType } from "react";

/**
 * Wrapper around React.lazy that handles chunk loading failures gracefully.
 * After a deploy, old chunk hashes become invalid (404). This wrapper:
 * 1. Catches the import error
 * 2. Forces a single page reload to fetch the new manifest
 * 3. Uses sessionStorage to prevent infinite reload loops
 * 4. If reload already happened, throws so ErrorBoundary catches it
 */
export function lazyRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(() =>
    importFn().catch((err: Error) => {
      const key = "chunk_reload";
      const hasReloaded = sessionStorage.getItem(key);

      if (!hasReloaded) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        // Return a promise that never resolves — reload will happen
        return new Promise<never>(() => {});
      }

      // Already reloaded once, clear flag and let ErrorBoundary handle it
      sessionStorage.removeItem(key);
      throw err;
    }),
  );
}
