export enum OrderStatus {
  RECEIVED = 'RECIBIDO',
  PREPARING = 'PREPARANDO',
  READY = 'LISTO',
  DELIVERED = 'ENTREGADO',
  CANCELLED = 'CANCELADO'
}

export enum PaymentMethod {
  PAY_AT_PICKUP = 'Pagar al recoger',
  ONLINE = 'Pago Online'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  notes?: string;
  extras: string[];
}

export interface Order {
  id: string; // Internal ID
  code: string; // User facing code (e.g. CAF-XXXX)
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}