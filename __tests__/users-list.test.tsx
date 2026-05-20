import { fireEvent, render, screen, within } from '@testing-library/react';

import UsersError from '@/app/users/error';
import UsersLoading from '@/app/users/loading';
import UsersPage from '@/app/users/page';
import UsersTable from '@/app/users/users-table';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type MockResponse = {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
};

function createResponse(data: unknown, ok = true, status = 200): MockResponse {
  return {
    ok,
    status,
    json: async () => data,
  };
}

function mockFetchSequence(responses: MockResponse[]) {
  const fetchMock = jest.fn();
  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce(response as unknown as Response);
  });
  (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('Users List', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders users with derived activity signals from mocked network calls', async () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@mail.com', website: 'alice.dev' },
      { id: 2, name: 'Bob', email: 'bob@mail.com', website: 'bob.dev' },
    ];

    const posts = [{ userId: 1 }, { userId: 1 }, { userId: 2 }];
    const todos = [
      { userId: 1, completed: true },
      { userId: 1, completed: false },
      { userId: 2, completed: false },
    ];

    const fetchMock = mockFetchSequence([
      createResponse(users),
      createResponse(posts),
      createResponse(todos),
    ]);

    const view = await UsersPage({ searchParams: Promise.resolve({}) });
    render(view);

    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
    expect(screen.getByText(/showing 2 users/i)).toBeInTheDocument();
    expect(screen.getByText('Posts: 2')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('filters by search and applies additional filter/sort', () => {
    const users = [
      {
        id: 1,
        name: 'Alpha User',
        email: 'alpha@mail.com',
        website: 'alpha.dev',
        totalPosts: 4,
        completedTodos: 2,
        pendingTodos: 1,
      },
      {
        id: 2,
        name: 'Beta User',
        email: 'beta@mail.com',
        website: 'beta.dev',
        totalPosts: 3,
        completedTodos: 0,
        pendingTodos: 5,
      },
    ];

    render(
      <UsersTable users={users} initialQuery="" initialSort="name-asc" initialFilter="all" />
    );

    fireEvent.change(screen.getByLabelText(/search users/i), {
      target: { value: 'beta' },
    });
    expect(screen.getAllByText('Beta User').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Alpha User')).toHaveLength(0);

    fireEvent.change(screen.getByLabelText(/search users/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/filter users by activity/i), {
      target: { value: 'no-completed' },
    });
    expect(screen.getAllByText('Beta User').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Alpha User')).toHaveLength(0);

    fireEvent.change(screen.getByLabelText(/filter users by activity/i), {
      target: { value: 'all' },
    });
    fireEvent.change(screen.getByLabelText(/sort users/i), {
      target: { value: 'most-pending' },
    });

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Beta User')).toBeInTheDocument();
  });

  it('shows loading, error, and empty states', () => {
    const reset = jest.fn();

    render(<UsersLoading />);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    render(<UsersError error={new Error('Network down')} reset={reset} />);
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    expect(screen.getByText(/network down/i)).toBeInTheDocument();

    const users = [
      {
        id: 1,
        name: 'Alpha User',
        email: 'alpha@mail.com',
        website: 'alpha.dev',
        totalPosts: 1,
        completedTodos: 1,
        pendingTodos: 0,
      },
    ];

    render(
      <UsersTable users={users} initialQuery="zzz" initialSort="name-asc" initialFilter="all" />
    );
    expect(screen.getByText(/no users matched/i)).toBeInTheDocument();
  });
});
