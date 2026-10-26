export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const ORDER_STATUSES = ["new", "paid", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  tagline: string;
  description: string;
  front: string;
  back: string;
  stock: Record<string, number>;
};

export type StoreSettings = {
  store_name: string;
  whatsapp_number: string;
  delivery_fee: number;
  contact_email: string;
};

export type OrderRow = {
  id: string;
  order_number: number;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  postal: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Receipt = { order: OrderRow; items: OrderItemRow[] };
