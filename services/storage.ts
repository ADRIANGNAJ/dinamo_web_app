import { Order, Product, OrderStatus, Extra } from '../types';
import { STORAGE_KEYS } from '../constants';
import { INITIAL_PRODUCTS, INITIAL_EXTRAS } from './mockData';

// Initialize storage
export const initStorage = () => {
  const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  
  const extras = localStorage.getItem(STORAGE_KEYS.EXTRAS);
  if (!extras) {
    localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(INITIAL_EXTRAS));
  }
};

// Logo Configuration
export const getAppLogo = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LOGO);
};

export const saveAppLogo = (base64Image: string): void => {
  localStorage.setItem(STORAGE_KEYS.LOGO, base64Image);
};

export const removeAppLogo = (): void => {
  localStorage.removeItem(STORAGE_KEYS.LOGO);
};

// Products
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : INITIAL_PRODUCTS;
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find((p) => p.id === id);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
};

// Extras
export const getExtras = (): Extra[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXTRAS);
  return data ? JSON.parse(data) : INITIAL_EXTRAS;
};

export const saveExtra = (extra: Extra): void => {
  const extras = getExtras();
  const index = extras.findIndex((e) => e.id === extra.id);
  if (index >= 0) {
    extras[index] = extra;
  } else {
    extras.push(extra);
  }
  localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(extras));
};

export const deleteExtra = (id: string): void => {
  const extras = getExtras();
  const filtered = extras.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(filtered));
};

// Orders
export const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const getMyOrders = (): Order[] => {
  const savedCodes = localStorage.getItem('my_order_codes');
  if (!savedCodes) return [];
  try {
    const codes: string[] = JSON.parse(savedCodes);
    const allOrders = getOrders();
    return allOrders.filter(o => codes.includes(o.code));
  } catch {
    return [];
  }
};

export const saveMyOrderCode = (code: string): void => {
  const savedCodes = localStorage.getItem('my_order_codes');
  const codes: string[] = savedCodes ? JSON.parse(savedCodes) : [];
  if (!codes.includes(code)) {
    codes.push(code);
    localStorage.setItem('my_order_codes', JSON.stringify(codes));
  }
};

export const getOrderByCode = (code: string): Order | undefined => {
  const orders = getOrders();
  return orders.find((o) => o.code === code);
};

export const createOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order); // Add to beginning
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
};

// Helpers
export const generateOrderCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CAF-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};