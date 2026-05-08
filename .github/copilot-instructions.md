# Copilot Instructions for Roam Kenya

## Project Overview

**Roam Kenya** is a React + Vite web application that helps users book airport transportation with real-time flight tracking. The app integrates with Supabase for authentication, data persistence, and real-time updates, and uses the AviationStack API for flight status monitoring.

## Build, Test, and Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter (ESLint with React best practices)
npm run lint

# Fix linting errors automatically
npm run lint -- --fix
```

**Note:** There are no automated tests currently. Manual testing should verify authentication, booking creation, and real-time flight tracking updates.

## Architecture

### Frontend Structure

```
src/
├── App.jsx                 # Main entry point, routing setup with AuthProvider
├── main.jsx               # React root
├── context/
│   └── AuthContext.jsx    # Global auth state provider
├── hooks/
│   ├── useAuth.js         # Authentication management (signin, signup, logout)
│   ├── useDatabase.js     # CRUD operations for Supabase tables
│   ├── useFlightTracking.js  # Real-time flight tracking with subscriptions
│   └── useRealtime.js     # Supabase realtime subscriptions
├── components/
│   ├── Navbar.jsx         # Navigation bar
│   ├── BookingForm.jsx    # Main booking interface with flight tracking
│   ├── Hero.jsx, Features.jsx, etc.  # Landing page components
│   └── ProtectedRoute.jsx # Route guard for authenticated pages
├── pages/
│   ├── AuthPage.jsx       # Login/signup UI
│   ├── Destination.jsx
│   ├── AboutPage.jsx
│   └── Services.jsx
└── lib/
    └── supabase.js        # Supabase client initialization
```

### Backend Architecture

The app uses **Supabase** for all backend services:

- **Authentication:** Email/password auth with session management
- **Database:** PostgreSQL with 4 core tables:
  - `user_profiles` - User account information
  - `bookings` - Customer booking records
  - `flights` - Flight data (synced from AviationStack API)
  - `flight_bookings` - Links bookings to flights with tracking status
- **Realtime:** WebSocket subscriptions push flight status updates to clients automatically
- **Edge Functions:** `track-flights` function runs every 5 minutes to fetch flight data and update tracking status

### Data Flow

1. User authenticates via `/auth` → stored in Supabase Auth
2. User creates booking via `/booking` → saved to `bookings` table
3. Edge Function runs every 5 min → queries AviationStack API → updates `flight_bookings` table
4. Supabase Realtime notifies frontend → UI updates in real-time without refresh
5. When flight lands → auto-pickup flag triggered

## Key Conventions

### Custom Hooks Pattern

All custom hooks follow this pattern:

```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook description
 */
export function useHookName() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Logic here
  
  return { state, loading, error, ...methods }
}
```

**Key patterns:**
- Always return an object with `loading` and `error` for consistent state management
- Use JSDoc comments to document hook purpose and usage
- Handle errors with try/catch, setting error state before throwing
- Set loading state before/after async operations

### Error Handling

All async operations follow this pattern:

```javascript
try {
  setError(null)
  setLoading(true)
  // operation
  if (err) throw err
} catch (err) {
  setError(err.message)
  throw err  // Re-throw for caller to handle
} finally {
  setLoading(false)
}
```

### Supabase Integration

- Authentication: Use `supabaseAuth` from `lib/supabase.js` for auth operations
- Database queries: Use `supabase` from `lib/supabase.js` for data operations
- Row Level Security (RLS): Users can only see their own bookings (enforced at DB level)
- Realtime subscriptions: Use `.on()` method to subscribe to table changes

Example:
```javascript
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId)
```

### Component Structure

- Use functional components with hooks
- Use JSX fragments (`<>`) to avoid unnecessary divs
- Style with Tailwind CSS utility classes (no CSS files)
- Keep components focused on single responsibility
- Protected routes use `ProtectedRoute` component wrapper

Example:
```jsx
import { useAuthContext } from '../context/AuthContext'

export function BookingForm() {
  const { user } = useAuthContext()
  
  return (
    <>
      {/* JSX here */}
    </>
  )
}
```

### Environment Variables

All Supabase credentials go in `.env.local` (never commit):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Access in code: `import.meta.env.VITE_SUPABASE_URL`

## Common Tasks

### Adding a New Page

1. Create file in `src/pages/PageName.jsx`
2. Import in `App.jsx`
3. Add route: `<Route path="/pagename" element={<PageName />} />`
4. If protected: wrap with `<ProtectedRoute>`

### Adding a Database Query

1. Use `useDatabase(tableName)` hook in your component
2. Call appropriate method: `select()`, `insert()`, `update()`, `filter()`, `upsert()`
3. Handle loading and error states

### Working with Real-time Updates

Use `useRealtime()` or `.on()` method from Supabase:

```javascript
const unsubscribe = supabase
  .on('*', { event: 'UPDATE', schema: 'public', table: 'flight_bookings' }, payload => {
    // Handle update
  })
  .subscribe()
```

### Adding Styling

Use Tailwind CSS utility classes directly in JSX:

```jsx
<div className="p-4 rounded-lg bg-blue-500 text-white">
  Content
</div>
```

Vite automatically compiles Tailwind via `@tailwindcss/vite` plugin.

## Important Resources

- **Supabase Schema:** See `SUPABASE_MIGRATIONS.sql` for complete database structure
- **Setup Guide:** Read `FLIGHT_TRACKING_SETUP.md` for deployment instructions
- **Architecture Details:** See `ARCHITECTURE.md` for comprehensive system diagrams
- **Recent Changes:** See `QUICK_REFERENCE.md` for list of recently modified files

## Debugging

**Check these places for errors:**

1. **Browser Console:** `F12` → Console tab (client-side errors)
2. **Supabase Dashboard → Logs:** Server-side and function errors
3. **Network Tab:** Check API requests to Supabase
4. **VS Code:** Set breakpoints and use debugger

**Common issues:**

- Auth not persisting? Check `.env.local` has correct Supabase credentials
- Bookings not appearing? Verify RLS policies allow your user to insert
- Real-time not updating? Check Supabase Realtime is enabled and subscription is active
- Edge function not running? Check cron job configuration: `*/5 * * * *`

## ESLint Configuration

The project uses ESLint with React best practices. Key rules:

- `no-unused-vars` - Allows unused uppercase variables (for component imports)
- React Hooks plugin - Ensures hooks rules of hooks compliance
- React Refresh - Allows fast refresh during development

Run `npm run lint` to check, `npm run lint -- --fix` to auto-fix issues.

## Dependencies Overview

**Core:**
- `react` (19.2.4) - UI library
- `react-router-dom` (7.13.1) - Client-side routing
- `@supabase/supabase-js` (2.43.4) - Supabase SDK

**UI/Styling:**
- `tailwindcss` (4.2.1) - Utility-first CSS framework
- `@tailwindcss/vite` (4.2.1) - Vite integration
- `lucide-react` - Icon library
- `embla-carousel-react` - Carousel component
- `framer-motion` - Animation library

**Build:**
- `vite` (8.0.0) - Build tool
- `@vitejs/plugin-react` - React support
- `eslint` - Linting

**Note:** No state management library (Redux/Zustand) - using Context API + hooks instead.
