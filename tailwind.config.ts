export function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-10 w-full mt-4" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-3">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
