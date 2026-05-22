-- Supabase SQL Migration for Roam Kenya Flight Tracking System
-- Run these commands in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  profile_picture TEXT,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  destination_location TEXT NOT NULL,
  flight_number TEXT,
  booking_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  duration TEXT,
  passengers INTEGER DEFAULT 1,
  vehicle_type TEXT,
  service_category TEXT, -- airport-transfer, chauffeur-rental, hotel-transfer, intercity-ride, wedding-travel, safari-tour, fleet-management
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT UNIQUE NOT NULL,
  airline_code TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, in-air, delayed, landed, cancelled
  scheduled_arrival TIMESTAMP WITH TIME ZONE,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  aircraft_type TEXT,
  gate TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create flight_bookings table (junction table)
CREATE TABLE IF NOT EXISTS flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number TEXT NOT NULL,
  tracking_status TEXT DEFAULT 'waiting', -- waiting, in-air, landed, picked_up, cancelled
  notification_sent BOOLEAN DEFAULT FALSE,
  auto_pickup_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT CHECK (role IN ('super_admin', 'booking_agent', 'driver')) NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

UPDATE admin_users SET is_active = TRUE WHERE is_active IS NULL;

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT NOT NULL,
  vehicle_plate TEXT,
  status TEXT CHECK (status IN ('available', 'on_trip', 'off_duty')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking_assignments table
CREATE TABLE IF NOT EXISTS booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES admin_users(id),
  driver_id UUID REFERENCES drivers(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create driver_performance table
CREATE TABLE IF NOT EXISTS driver_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  trips_completed INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0,
  on_time_rate FLOAT DEFAULT 0,
  cancellation_rate FLOAT DEFAULT 0,
  earnings_today NUMERIC DEFAULT 0,
  earnings_week NUMERIC DEFAULT 0,
  earnings_total NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_number ON bookings(flight_number);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_booking_id ON flight_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_user_id ON flight_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_tracking_status ON flight_bookings(tracking_status);
CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'booking_agent')
    )
  );

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for flights (public read, admin write)
DROP POLICY IF EXISTS "Flights are public read" ON flights;
CREATE POLICY "Flights are public read" ON flights
  FOR SELECT USING (TRUE);

-- RLS Policies for flight_bookings
DROP POLICY IF EXISTS "Users can view own flight bookings" ON flight_bookings;
CREATE POLICY "Users can view own flight bookings" ON flight_bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all flight bookings" ON flight_bookings;
CREATE POLICY "Admins can view all flight bookings" ON flight_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'booking_agent')
    )
  );

DROP POLICY IF EXISTS "Users can create flight bookings" ON flight_bookings;
CREATE POLICY "Users can create flight bookings" ON flight_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own flight bookings" ON flight_bookings;
CREATE POLICY "Users can update own flight bookings" ON flight_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for admin_users
DROP POLICY IF EXISTS "Admins can view own admin row" ON admin_users;
CREATE POLICY "Admins can view own admin row" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  );

-- RLS Policies for drivers
DROP POLICY IF EXISTS "Agents can view available drivers" ON drivers;
CREATE POLICY "Agents can view available drivers" ON drivers
  FOR SELECT USING (
    status = 'available'
    AND EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'booking_agent')
    )
  );

DROP POLICY IF EXISTS "Super admins can manage drivers" ON drivers;
CREATE POLICY "Super admins can manage drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  );

-- RLS Policies for booking_assignments
DROP POLICY IF EXISTS "Agents can create assignments" ON booking_assignments;
CREATE POLICY "Agents can create assignments" ON booking_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'booking_agent')
    )
  );

DROP POLICY IF EXISTS "Super admins can view all assignments" ON booking_assignments;
CREATE POLICY "Super admins can view all assignments" ON booking_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Drivers can view own assignments" ON booking_assignments;
CREATE POLICY "Drivers can view own assignments" ON booking_assignments
  FOR SELECT USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "Agents can view own assignments" ON booking_assignments;
CREATE POLICY "Agents can view own assignments" ON booking_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.id = booking_assignments.agent_id
    )
  );

-- RLS Policies for driver_performance
DROP POLICY IF EXISTS "Super admins can manage driver performance" ON driver_performance;
CREATE POLICY "Super admins can manage driver performance" ON driver_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users AS super_admins
      WHERE super_admins.user_id = auth.uid()
        AND super_admins.role = 'super_admin'
        AND super_admins.is_active = TRUE
    )
  );

-- Create function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flights_updated_at ON flights;
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_bookings_updated_at ON flight_bookings;
CREATE TRIGGER update_flight_bookings_updated_at
  BEFORE UPDATE ON flight_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT SELECT ON flights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON flight_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON booking_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON drivers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON driver_performance TO authenticated;
