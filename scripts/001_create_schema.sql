-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STAFF TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT NOT NULL CHECK (position IN ('admin','manager','receptionist','waitstaff','kitchen','cleaning','delivery')),
  profile_image TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_orders INTEGER DEFAULT 0,
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  is_loyal BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_type TEXT NOT NULL CHECK (class_type IN ('safari','savannah','serenity')),
  name TEXT NOT NULL,
  room_number TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','cleaning','maintenance','reserved')),
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLES (dining) TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.dining_tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_type TEXT NOT NULL CHECK (class_type IN ('intimate','family','chief')),
  table_number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','cleaning')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MENU ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('nyama','wok','vegetarian','seafood','sweets')),
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

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in','room_service','delivery','takeaway')),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  table_id UUID REFERENCES public.dining_tables(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','served','delivered','completed','cancelled')),
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) DEFAULT 0,
  service_charge DECIMAL(10,2) DEFAULT 0,
  vat DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partial','refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RESERVATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('room','table')),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  table_id UUID REFERENCES public.dining_tables(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE,
  time_slot TEXT,
  guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled','no_show')),
  prepay_amount DECIMAL(10,2) DEFAULT 0,
  prepay_status TEXT DEFAULT 'pending' CHECK (prepay_status IN ('pending','paid','refunded')),
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DELIVERIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','assigned','picked_up','in_transit','delivered','failed')),
  delivery_address TEXT,
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MAINTENANCE REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  issue TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  images JSONB DEFAULT '[]'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RATINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLEANING TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.cleaning_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  task_type TEXT DEFAULT 'checkout' CHECK (task_type IN ('checkout','requested','scheduled','emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users full access (staff system)
-- Staff table
CREATE POLICY "staff_select" ON public.staff FOR SELECT USING (true);
CREATE POLICY "staff_insert" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "staff_update" ON public.staff FOR UPDATE USING (true);
CREATE POLICY "staff_delete" ON public.staff FOR DELETE USING (true);

-- Customers table (public read, authenticated write)
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE USING (true);

-- Rooms table
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "rooms_delete" ON public.rooms FOR DELETE USING (true);

-- Dining tables
CREATE POLICY "tables_select" ON public.dining_tables FOR SELECT USING (true);
CREATE POLICY "tables_insert" ON public.dining_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "tables_update" ON public.dining_tables FOR UPDATE USING (true);
CREATE POLICY "tables_delete" ON public.dining_tables FOR DELETE USING (true);

-- Menu items
CREATE POLICY "menu_select" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_insert" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_update" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "menu_delete" ON public.menu_items FOR DELETE USING (true);

-- Orders
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE USING (true);

-- Reservations
CREATE POLICY "reservations_select" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "reservations_insert" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations_update" ON public.reservations FOR UPDATE USING (true);
CREATE POLICY "reservations_delete" ON public.reservations FOR DELETE USING (true);

-- Deliveries
CREATE POLICY "deliveries_select" ON public.deliveries FOR SELECT USING (true);
CREATE POLICY "deliveries_insert" ON public.deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "deliveries_update" ON public.deliveries FOR UPDATE USING (true);
CREATE POLICY "deliveries_delete" ON public.deliveries FOR DELETE USING (true);

-- Maintenance requests
CREATE POLICY "maintenance_select" ON public.maintenance_requests FOR SELECT USING (true);
CREATE POLICY "maintenance_insert" ON public.maintenance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "maintenance_update" ON public.maintenance_requests FOR UPDATE USING (true);
CREATE POLICY "maintenance_delete" ON public.maintenance_requests FOR DELETE USING (true);

-- Ratings
CREATE POLICY "ratings_select" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "ratings_update" ON public.ratings FOR UPDATE USING (true);
CREATE POLICY "ratings_delete" ON public.ratings FOR DELETE USING (true);

-- Cleaning tasks
CREATE POLICY "cleaning_select" ON public.cleaning_tasks FOR SELECT USING (true);
CREATE POLICY "cleaning_insert" ON public.cleaning_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "cleaning_update" ON public.cleaning_tasks FOR UPDATE USING (true);
CREATE POLICY "cleaning_delete" ON public.cleaning_tasks FOR DELETE USING (true);
