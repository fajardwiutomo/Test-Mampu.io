import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type UserDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; sort?: string; filter?: string }>;
};

type UserDetails = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
};

type Post = {
  id: number;
  title: string;
  body: string;
};

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (response.status === 404) {
    throw new Error('NOT_FOUND');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

async function getUserById(id: string): Promise<UserDetails | null> {
  try {
    const user = await fetchJson<UserDetails>(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!user?.id) {
      return null;
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return null;
    }

    throw error;
  }
}

export async function generateMetadata({ params }: UserDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return {
      title: 'User not found',
    };
  }

  return {
    title: `${user.name} | User Details`,
    description: `Details for user ${user.name}`,
  };
}

export default async function UserDetailsPage({ params, searchParams }: UserDetailsPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const [posts, todos] = await Promise.all([
    fetchJson<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${id}`),
    fetchJson<Todo[]>(`https://jsonplaceholder.typicode.com/todos?userId=${id}`),
  ]);

  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  const preserved = await searchParams;
  const backParams = new URLSearchParams();
  if (preserved.search) backParams.set('search', preserved.search);
  if (preserved.sort) backParams.set('sort', preserved.sort);
  if (preserved.filter) backParams.set('filter', preserved.filter);
  const backToListHref = backParams.toString() ? `/users?${backParams.toString()}` : '/users';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={backToListHref}
        className="mb-6 inline-flex items-center text-sm font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
      >
        Back to list
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{user.name}</h1>

        <dl className="mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Username</dt>
            <dd className="mt-1">{user.username}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Email</dt>
            <dd className="mt-1 break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Phone</dt>
            <dd className="mt-1">{user.phone}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Website</dt>
            <dd className="mt-1 break-all">{user.website}</dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Company</h2>
            <p className="mt-2 text-sm font-medium text-slate-900">{user.company.name}</p>
            <p className="mt-1 text-sm text-slate-700">{user.company.catchPhrase}</p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Address</h2>
            <p className="mt-2 text-sm text-slate-900">
              {user.address.street}, {user.address.suite}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {user.address.city}, {user.address.zipcode}
            </p>
          </section>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No posts found for this user.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {posts.slice(0, 5).map((post) => (
                <li key={post.id} className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">{post.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-700">{post.body}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Todos ({todos.length})</h2>
          <p className="mt-2 text-sm text-slate-600">
            Completed: {completedTodos.length} | Pending: {pendingTodos.length}
          </p>

          {todos.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No todos found for this user.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {todos.slice(0, 8).map((todo) => (
                <li key={todo.id} className="flex items-start gap-2 text-sm text-slate-700">
                  <span
                    className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${
                      todo.completed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="break-words">{todo.title}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
