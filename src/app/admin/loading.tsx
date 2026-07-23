export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-[var(--surface)] rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-[var(--surface)] rounded" />
                <div className="h-8 w-16 bg-[var(--surface)] rounded" />
              </div>
              <div className="w-12 h-12 bg-[var(--surface)] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="card p-4">
        <div className="h-6 w-40 bg-[var(--surface)] rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[var(--surface)] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
