export type StaffPosition =
  | "admin"
  | "manager"
  | "receptionist"
  | "waitstaff"
  | "kitchen"
  | "cleaning"
  | "delivery";

export type RoomClass = "safari" | "savannah" | "serenity";
export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

export type TableClass = "intimate" | "family" | "chiefs";
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export type MenuCategory =
  | "nyama"
  | "wok"
  | "vegetarian"
  | "seafood"
  | "sweets"
  | "drinks";

export type OrderType = "dine_in" | "room_service" | "delivery" | "takeaway";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "delivered"
  | "completed"
  | "cancelled";
export type PaymentMethod =
  | "mpesa"
  | "cash"
  | "card"
  | "tcash"
  | "airtel_money";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface Staff {
  id: string;
  auth_id: string | null;
  full_name: string;
  position: StaffPosition;
  phone: string | null;
  profile_image: string | null;
  rating: number;
  total_orders: number;
  hire_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  is_loyal: boolean;
  total_visits: number;
  preferred_staff_id: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  class_type: RoomClass;
  name: string;
  room_number: string;
  price: number;
  features: string[];
  status: RoomStatus;
  images: string[];
  floor: number;
  created_at: string;
}

export interface DiningTable {
  id: string;
  class_type: TableClass;
  table_number: number;
  capacity: number;
  status: TableStatus;
  location: string;
  features: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  preparation_time: number;
  is_available: boolean;
  rating_avg: number;
  total_reviews: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  order_type: OrderType;
  customer_id: string | null;
  staff_id: string | null;
  table_id: string | null;
  room_id: string | null;
  status: OrderStatus;
  subtotal: number;
  service_charge: number;
  vat: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  transaction_code: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  // Joined fields
  customer?: Customer;
  staff?: Staff;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Reservation {
  id: string;
  reservation_type: "room" | "table";
  customer_id: string;
  room_id: string | null;
  table_id: string | null;
  check_in: string;
  check_out: string | null;
  time_slot: string | null;
  guests: number;
  status: string;
  prepay_amount: number;
  prepay_status: string;
  payment_method: string | null;
  transaction_code: string | null;
  special_requests: string | null;
  created_at: string;
  customer?: Customer;
  room?: Room;
  dining_table?: DiningTable;
}

export interface Delivery {
  id: string;
  order_id: string;
  staff_id: string | null;
  status: string;
  delivery_address: string | null;
  pickup_time: string | null;
  delivery_time: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  order?: Order;
  staff?: Staff;
}

export interface MaintenanceRequest {
  id: string;
  room_id: string | null;
  reported_by: string | null;
  issue: string;
  priority: string;
  status: string;
  images: string[];
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  room?: Room;
  reporter?: Staff;
}

export interface Rating {
  id: string;
  customer_id: string | null;
  staff_id: string | null;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: Customer;
  staff?: Staff;
}

export interface CleaningTask {
  id: string;
  room_id: string;
  staff_id: string | null;
  task_type: string;
  status: string;
  requested_by: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  room?: Room;
  staff?: Staff;
}

// Cart types for customer portal
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// Portal session types
export type PortalType = "management" | "staff" | "customer";

export interface PortalSession {
  portalType: PortalType;
  staffId?: string;
  customerId?: string;
  role?: StaffPosition;
}

// Helper for formatting KES
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}
