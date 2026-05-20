export default function UsersLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
