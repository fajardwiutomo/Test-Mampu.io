'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { EnrichedUser } from './page';

type SortOption = 'name-asc' | 'name-desc' | 'most-pending';
type ActivityFilter = 'all' | 'has-pending' | 'no-completed';

type UsersTableProps = {
  users: EnrichedUser[];
  initialQuery: string;
  initialSort: string;
  initialFilter: string;
};

const validSorts: SortOption[] = ['name-asc', 'name-desc', 'most-pending'];
const validFilters: ActivityFilter[] = ['all', 'has-pending', 'no-completed'];

export default function UsersTable({
  users,
  initialQuery,
  initialSort,
  initialFilter,
}: UsersTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(
    validSorts.includes(initialSort as SortOption) ? (initialSort as SortOption) : 'name-asc'
  );
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>(
    validFilters.includes(initialFilter as ActivityFilter)
      ? (initialFilter as ActivityFilter)
      : 'all'
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const searched = normalizedQuery
      ? users.filter((user) => {
          return (
            user.name.toLowerCase().includes(normalizedQuery) ||
            user.email.toLowerCase().includes(normalizedQuery)
          );
        })
      : users;

    const activityFiltered = searched.filter((user) => {
      if (activityFilter === 'has-pending') {
        return user.pendingTodos > 0;
      }

      if (activityFilter === 'no-completed') {
        return user.completedTodos === 0;
      }

      return true;
    });

    const sorted = [...activityFiltered].sort((a, b) => {
      if (sortBy === 'most-pending') {
        return b.pendingTodos - a.pendingTodos;
      }

      const nameOrder = a.name.localeCompare(b.name);
      return sortBy === 'name-asc' ? nameOrder : -nameOrder;
    });

    return sorted;
  }, [users, query, sortBy, activityFilter]);

  const goToDetails = (userId: number) => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('search', query.trim());
    }

    if (sortBy !== 'name-asc') {
      params.set('sort', sortBy);
    }

    if (activityFilter !== 'all') {
      params.set('filter', activityFilter);
    }

    const queryString = params.toString();
    const target = queryString ? `/users/${userId}?${queryString}` : `/users/${userId}`;

    router.push(target);
  };

  const resultCount = filteredUsers.length;

  return (
    <>
      <section className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Search
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
            aria-label="Search users by name or email"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Activity Filter
          <select
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value as ActivityFilter)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
            aria-label="Filter users by activity"
          >
            <option value="all">All users</option>
            <option value="has-pending">Has pending todos</option>
            <option value="no-completed">No completed todos</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Sort
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
            aria-label="Sort users"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="most-pending">Most pending todos</option>
          </select>
        </label>
      </section>

      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        Showing {resultCount} user{resultCount === 1 ? '' : 's'}
      </p>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Website</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Posts</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Completed</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Pending</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    <button
                      type="button"
                      onClick={() => goToDetails(user.id)}
                      className="rounded text-left underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {user.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-sky-700 break-all">{user.website}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.totalPosts}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700">{user.completedTodos}</td>
                  <td className="px-4 py-3 text-sm text-amber-700">{user.pendingTodos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => goToDetails(user.id)}
              className="w-full rounded-lg border border-slate-200 p-4 text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="mt-1 break-all text-sm text-slate-700">{user.email}</p>
              <p className="mt-1 break-all text-xs text-sky-700">{user.website}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">Posts: {user.totalPosts}</span>
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">Done: {user.completedTodos}</span>
                <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">Pending: {user.pendingTodos}</span>
              </div>
            </button>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-600">
            No users matched your current search/filter. Try changing search keyword or activity filter.
          </p>
        ) : null}
      </section>
    </>
  );
}
