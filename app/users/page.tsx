import UsersTable from './users-table';

type User = {
  id: number;
  name: string;
  email: string;
  website: string;
};

type Post = {
  userId: number;
};

type Todo = {
  userId: number;
  completed: boolean;
};

export type EnrichedUser = User & {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
};

type UsersPageProps = {
  searchParams: Promise<{ search?: string; sort?: string; filter?: string; page?: string }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

function buildUserActivity(users: User[], posts: Post[], todos: Todo[]): EnrichedUser[] {
  return users.map((user) => {
    const totalPosts = posts.filter((post) => post.userId === user.id).length;
    const userTodos = todos.filter((todo) => todo.userId === user.id);
    const completedTodos = userTodos.filter((todo) => todo.completed).length;
    const pendingTodos = userTodos.length - completedTodos;

    return {
      ...user,
      totalPosts,
      completedTodos,
      pendingTodos,
    };
  });
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const [users, posts, todos] = await Promise.all([
    fetchJson<User[]>('https://jsonplaceholder.typicode.com/users'),
    fetchJson<Post[]>('https://jsonplaceholder.typicode.com/posts'),
    fetchJson<Todo[]>('https://jsonplaceholder.typicode.com/todos'),
  ]);

  const enrichedUsers = buildUserActivity(users, posts, todos);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">User Operations workspace powered by JSONPlaceholder</p>
      </header>

      <UsersTable
        users={enrichedUsers}
        initialQuery={params.search ?? ''}
        initialSort={params.sort ?? 'name-asc'}
        initialFilter={params.filter ?? 'all'}
        initialPage={params.page ?? '1'}
      />
    </main>
  );
}
