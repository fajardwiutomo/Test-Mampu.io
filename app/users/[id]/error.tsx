'use client';

type UserDetailsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function UserDetailsError({ error, reset }: UserDetailsErrorProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-slate-900">Failed to load user details</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message || 'Please try again.'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </main>
  );
}
