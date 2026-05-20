# Frontend Take Home Test - User Operations

Project ini dibuat dengan Next.js (App Router) + TypeScript untuk memenuhi requirement take home test frontend.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Jest + React Testing Library

## Fitur yang Diimplementasikan

- Users list di `/users`
- Fetch data dari JSONPlaceholder (`users`, `posts`, `todos`)
- Activity signals per user: total posts, completed todos, pending todos
- Search (name/email), sort, dan filter activity
- Pagination pada users list
- Detail user di `/users/[id]` dengan:
  - biodata user
  - company + address
  - section posts + todos
- Preserve state list saat list -> detail -> back (search/sort/filter/page)
- Loading state + error state per route
- Invalid user id handling (`notFound`)
- ISR (`revalidate: 60`) pada data workspace users

## Menjalankan Project

### 1. Install dependencies

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:3000`, lalu akses `http://localhost:3000/users`.

### 3. Build production

```bash
npm run build
npm run start
```

## Menjalankan Test

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Lint:

```bash
npm run lint
```

## Struktur Arsitektur Singkat

- `app/users/page.tsx`
  - Server Component untuk orkestrasi fetch `users/posts/todos`
  - Hitung derived activity signals
  - Forward state awal dari query string ke komponen client
- `app/users/users-table.tsx`
  - Client Component untuk interaksi UI (search/filter/sort/pagination)
  - Render desktop table + mobile cards
  - Navigasi ke detail sambil membawa state list via query params
- `app/users/[id]/page.tsx`
  - Server Component detail user
  - Fetch user by id + posts/todos by user
  - Generate metadata untuk SEO dasar
  - Preserve query state saat kembali ke list
- `app/users/loading.tsx`, `app/users/error.tsx`
  - Loading/error boundary untuk list
- `app/users/[id]/loading.tsx`, `app/users/[id]/error.tsx`
  - Loading/error boundary untuk details
- `__tests__/users-list.test.tsx`
  - Unit test users list + mock network
- `__tests__/user-details.test.tsx`
  - Unit test user details + mock network

## Keputusan Teknis

1. Server fetch + client interactivity
- Data utama di-fetch di Server Component untuk flow data yang jelas dan cocok dengan App Router.
- Interaksi (search/filter/sort/pagination) ditaruh di Client Component agar responsif di browser.

2. Derived signals dihitung di server
- `totalPosts`, `completedTodos`, `pendingTodos` dihitung sebelum render UI agar komponen presentasional tetap sederhana.

3. State persistence via query params
- `search`, `sort`, `filter`, `page` dipertahankan saat pindah halaman agar UX tidak reset tiba-tiba.

4. Route-level loading/error
- Memakai `loading.tsx` dan `error.tsx` per route untuk handling loading gagal yang konsisten.

5. Testing strategy
- Unit test fokus pada behavior utama requirement.
- Network di-mock agar test stabil, cepat, dan tidak tergantung API eksternal.

## Catatan

Data source menggunakan:

- `https://jsonplaceholder.typicode.com/users`
- `https://jsonplaceholder.typicode.com/posts`
- `https://jsonplaceholder.typicode.com/todos`
