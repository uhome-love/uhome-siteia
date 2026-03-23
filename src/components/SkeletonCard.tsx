export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="aspect-[4/3] rounded-xl bg-muted" />
        <div className="px-0.5 pt-3 pb-2 space-y-2">
          <div className="h-3.5 w-[85%] rounded bg-muted" />
          <div className="h-3 w-[60%] rounded bg-muted" />
          <div className="mt-2 h-5 w-[40%] rounded bg-muted" />
          <div className="h-3 w-[50%] rounded bg-muted" />
          <div className="h-3 w-[35%] rounded bg-muted" />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:block">
        <div className="aspect-[4/3] rounded-xl bg-muted" />
        <div className="space-y-1.5 px-0.5 pt-2.5">
          <div className="h-3.5 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="mt-1 h-4 w-1/3 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
