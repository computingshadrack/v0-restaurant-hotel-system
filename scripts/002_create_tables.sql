CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT NOT NULL,
  profile_image TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_orders INTEGER DEFAULT 0,
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  is_loyal BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_type TEXT NOT NULL,
  name TEXT NOT NULL,
  room_number TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dining_tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_type TEXT NOT NULL,
  table_number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  preparation_time INTEGER DEFAULT 15,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
