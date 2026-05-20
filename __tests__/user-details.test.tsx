import { render, screen } from '@testing-library/react';

import UserDetailsError from '@/app/users/[id]/error';
import UserDetailsLoading from '@/app/users/[id]/loading';
import UserDetailsPage from '@/app/users/[id]/page';

const notFoundMock = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
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

describe('User Details', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user details with posts and todos sections using mocked network calls', async () => {
    const user = {
      id: 1,
      name: 'Alice',
      username: 'alice',
      email: 'alice@mail.com',
      phone: '123',
      website: 'alice.dev',
      company: { name: 'Alice Co', catchPhrase: 'Build fast' },
      address: { street: 'A St', suite: 'Suite 1', city: 'City', zipcode: '10000' },
    };

    const posts = [{ id: 1, title: 'First post', body: 'Body text' }];
    const todos = [
      { id: 1, title: 'Done task', completed: true },
      { id: 2, title: 'Pending task', completed: false },
    ];

    const fetchMock = mockFetchSequence([
      createResponse(user),
      createResponse(posts),
      createResponse(todos),
    ]);

    const view = await UserDetailsPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({}),
    });
    render(view);

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByText(/posts \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/todos \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('First post')).toBeInTheDocument();
    expect(screen.getByText('Pending task')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('handles loading and error states', () => {
    const reset = jest.fn();

    render(<UserDetailsLoading />);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    render(<UserDetailsError error={new Error('Boom')} reset={reset} />);
    expect(screen.getByText(/failed to load user details/i)).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it('handles invalid user id or missing user data', async () => {
    mockFetchSequence([createResponse({})]);

    await expect(
      UserDetailsPage({
        params: Promise.resolve({ id: '999' }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('throws when user details request fails', async () => {
    mockFetchSequence([createResponse({}, false, 500)]);

    await expect(
      UserDetailsPage({
        params: Promise.resolve({ id: '1' }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow(/failed to fetch/i);
  });
});
