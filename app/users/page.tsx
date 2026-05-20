import UsersTable from './users-table';

type User = {
  id: number;
  name: string;
  email: string;
  website: string;
};

async function getUsers(): Promise<User[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">Data source: JSONPlaceholder</p>
      </header>

      <UsersTable users={users} />
    </main>
  );
}
