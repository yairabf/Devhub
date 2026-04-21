export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-muted/40"
          />
        ))}
      </div>

      <section className="space-y-3">
        <div className="h-3 w-36 animate-pulse rounded bg-muted/40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-muted/40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
