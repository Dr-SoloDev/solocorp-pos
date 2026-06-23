export function ListSkeleton() {
  return (
    <div className="space-y-md">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-steel-200 p-4 animate-pulse"
        >
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-steel-200 rounded w-28" />
            <div className="h-5 bg-steel-200 rounded-full w-16" />
          </div>
          <div className="h-3 bg-steel-200 rounded w-40 mb-3" />
          <div className="flex justify-between">
            <div className="h-3 bg-steel-200 rounded w-24" />
            <div className="h-3 bg-steel-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
