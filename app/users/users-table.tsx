'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  website: string;
};

type SortOption = 'name-asc' | 'name-desc';

type UsersTableProps = {
  users: User[];
};

export default function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? users.filter((user) => {
          return (
            user.name.toLowerCase().includes(normalizedQuery) ||
            user.email.toLowerCase().includes(normalizedQuery)
          );
        })
      : users;

    const sorted = [...filtered].sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return sortBy === 'name-asc' ? result : -result;
    });

    return sorted;
  }, [users, query, sortBy]);

  return (
    <>
      <section className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Search
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Sort
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Website
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer hover:bg-slate-50 focus-within:bg-slate-50"
                  onClick={() => router.push(`/users/${user.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/users/${user.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-sky-700">
                    <a
                      href={`https://${user.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
                    >
                      {user.website}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600">No users matched your search.</p>
        ) : null}
      </section>
    </>
  );
}
