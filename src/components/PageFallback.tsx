import { Navbar } from "@/components/Navbar";

export function PageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14">
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <div className="h-1 w-24 animate-pulse rounded bg-primary/30" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-muted" />
                <div className="space-y-2 pt-3">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
