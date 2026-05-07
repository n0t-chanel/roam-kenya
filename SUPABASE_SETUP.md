# Supabase Backend Setup Guide

This guide will help you set up Supabase as the backend for the Roam Kenya project.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `roam-kenya` (or your preferred name)
   - **Database Password**: Create a strong password (you'll need this)
   - **Region**: Select the region closest to your users
4. Click "Create new project" and wait for the project to be set up

## Step 2: Get Your Credentials

1. Once your project is created, go to **Settings > API**
2. You'll find:
   - **Project URL**: Copy this (it's your `VITE_SUPABASE_URL`)
   - **anon public key**: Copy this (it's your `VITE_SUPABASE_ANON_KEY`)
   - **service_role key**: Copy this (it's your `VITE_SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Install Dependencies

```bash
npm install
```

The Supabase JavaScript client (`@supabase/supabase-js`) has already been added to package.json.

## Step 5: Create Database Tables

In the Supabase console, go to **SQL Editor** and create tables for your application. Here's an example for a tours/destinations table:

```sql
-- Create destinations table
CREATE TABLE destinations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tours table
CREATE TABLE tours (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INT,
  price DECIMAL(10, 2),
  available_spots INT,
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  num_travelers INT,
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Step 6: Enable Authentication

1. Go to **Authentication > Providers** in Supabase console
2. Ensure "Email" is enabled (it is by default)
3. Optionally enable other providers (Google, GitHub, etc.)

## Step 7: Set up Row Level Security (RLS)

Go to **Authentication > Policies** and set up security policies. Example:

```sql
-- Policies for destinations (public read)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destinations are viewable by everyone"
  ON destinations
  FOR SELECT
  USING (true);

-- Policies for bookings (user-specific)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create bookings for themselves"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Usage Examples

### Using the useAuth Hook

```jsx
import { useAuthContext } from './context/AuthContext'

function Profile() {
  const { user, signOut, loading } = useAuthContext()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Using the useDatabase Hook

```jsx
import { useDatabase } from './hooks/useDatabase'
import { useEffect, useState } from 'react'

function ToursList() {
  const { select, loading, error } = useDatabase('tours')
  const [tours, setTours] = useState([])

  useEffect(() => {
    const fetchTours = async () => {
      const data = await select()
      setTours(data)
    }
    fetchTours()
  }, [])

  if (loading) return <div>Loading tours...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {tours.map(tour => (
        <div key={tour.id}>
          <h2>{tour.title}</h2>
          <p>{tour.description}</p>
          <p>Price: ${tour.price}</p>
        </div>
      ))}
    </div>
  )
}
```

### Using Real-time Subscriptions

```jsx
import { useRealtime } from './hooks/useRealtime'

function LiveBookings() {
  const { data: bookings, loading, error } = useRealtime('bookings')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Recent Bookings</h2>
      {bookings.map(booking => (
        <div key={booking.id}>
          <p>Booking #{booking.id}</p>
          <p>Status: {booking.status}</p>
        </div>
      ))}
    </div>
  )
}
```

### Protecting Routes

```jsx
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  )
}
```

## Security Best Practices

1. **Never expose your service role key**: Keep `VITE_SUPABASE_SERVICE_ROLE_KEY` secret
2. **Use Row Level Security**: Always enable RLS on your tables
3. **Validate input**: Always validate user input before sending to Supabase
4. **Use environment variables**: Store secrets in `.env.local` (don't commit to git)
5. **Environment-specific keys**: Use different Supabase projects for development and production

## Troubleshooting

### Missing environment variables error
- Make sure `.env.local` file exists in the root directory
- Verify variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Authentication not working
- Check that Email provider is enabled in Supabase console
- Verify your redirect URLs in Authentication > Settings

### RLS blocking queries
- Check that you've created proper policies
- Use Supabase console to test queries and see error details

## Next Steps

1. Create your database schema based on your app requirements
2. Set up authentication flows (sign up, login, password reset)
3. Implement data management with the provided hooks
4. Deploy your application with production Supabase credentials
5. Monitor your Supabase usage in the console dashboard

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
