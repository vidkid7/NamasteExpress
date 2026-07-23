export function ArticleCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-48 w-full rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="skeleton h-72 lg:h-96 w-full rounded-b-none" />
        <div className="p-6 space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-7 w-full" />
          <div className="skeleton h-7 w-4/5" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card flex flex-row">
            <div className="skeleton h-28 w-36 shrink-0 rounded-r-none" />
            <div className="p-3 space-y-2 flex-1">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="card p-4 space-y-4">
      <div className="skeleton h-6 w-32" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="skeleton h-5 w-5 shrink-0 rounded-full" />
          <div className="space-y-1 flex-1">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
