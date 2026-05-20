import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type UserDetailsPageProps = {
  params: Promise<{ id: string }>;
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

async function getUserById(id: string): Promise<UserDetails | null> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  const user = (await response.json()) as UserDetails;

  if (!user?.id) {
    return null;
  }

  return user;
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

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/users"
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
            <dd className="mt-1">{user.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Phone</dt>
            <dd className="mt-1">{user.phone}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Website</dt>
            <dd className="mt-1">{user.website}</dd>
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
    </main>
  );
}
