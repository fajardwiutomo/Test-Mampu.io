export default function UserDetailsLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mb-6 h-6 w-32 animate-pulse rounded bg-slate-200" />
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-5 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
    </main>
  );
}
