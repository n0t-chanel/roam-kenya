# Copilot Instructions for Roam Kenya

Roam Kenya is a React + Vite app for airport transport bookings with Supabase-backed auth, data, and real-time updates, plus Paystack payments.

## Build, test, and lint commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Fix lint errors
npm run lint -- --fix
```

Tests: no test script is configured in package.json.

## High-level architecture

- **Frontend:** React SPA with routes defined in `src/App.jsx`. Public pages share the main `Navbar`/`Footer`; admin/agent/driver sections are wrapped with `ProtectedAdminRoute` and use `AdminAuthProvider` for role checks.
- **Backend:** Supabase provides auth + Postgres. Core tables are defined in `SUPABASE_MIGRATIONS.sql` (`user_profiles`, `bookings`, `flights`, `flight_bookings`, `admin_users`, `drivers`, `booking_assignments`, etc.). Payments are defined in `PAYSTACK_MIGRATIONS.sql` (`payments` plus booking payment fields).
- **Realtime flight tracking:** `useFlightTracking` and `useRealtime` subscribe to `flight_bookings` via `supabase.channel(...).on('postgres_changes', ...)`, updating UI as statuses change.
- **Edge Functions:** Deno functions in `supabase/functions/*/index.ts` handle Paystack verification/refunds and admin agent creation using service-role credentials.

## Key conventions

- **Hooks shape:** custom hooks return `{ loading, error, ...methods }` and wrap async work with `setLoading`/`setError` plus re-throws (see `useDatabase`, `useAuth`, `useFlightTracking`, `useRealtime`).
- **Supabase clients:** use `supabaseAuth` (auth) and `supabase` (data) from `src/lib/supabase.js`. The client throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing.
- **Realtime cleanup:** always unsubscribe in effect cleanup (`subscription?.unsubscribe()`).
