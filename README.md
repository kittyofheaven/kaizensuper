# RTB Connect Admin Frontend

Next.js (App Router, TypeScript, Tailwind v4) admin dashboard with styling inspired by `../kaizenfe`. It follows the backend playbook in `admin.md` and `API_DOCUMENTATION.md`: login → probe `/users` for admin → manage users/booking modules.

## Quickstart

```bash
npm install
npm run dev
```

Env config (`.env.local`):

```
NEXT_PUBLIC_API_BASE_URL=https://api.rtbconnect.space
# automatically appends /api/v1 if belum ada
```

## What’s inside

- Dark, neon-accented theme (Space Grotesk) matching kaizenfe palette.
- Auth context: login via `POST /auth/login`, profile hydration, admin probe `GET /users?page=1&limit=1`, logout clears tokens.
- Routes:
  - `/login` – admin login card with API hints.
  - `/admin` – dashboard summary (user count + booking totals + latest feed from modules listed di admin.md).
  - `/admin/users` – list/search/filter users (`/users`, `/users/wa/{nomorWa}`, `/users/angkatan/{angkatanId}`) with pagination shell.
  - `/admin/bookings` – module map for communal/serbaguna/cws/theater/dapur/mesin cuci endpoints to start UI builders.
  - `/admin/settings` – change password via `PUT /auth/update-password`.
- API helper in `src/lib/api.ts` with type-safe responses and sane fallbacks on 401/403.

## Scripts

- `npm run dev` – start dev server.
- `npm run build` – production build.
- `npm run start` – serve production build.
- `npm run lint` – lint codebase.
