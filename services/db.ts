/**
 * Database Service (Firestore)
 * Replaces storage.ts for remote data persistence
 */
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Extra, Order, OrderStatus } from '../types';

// Collection References
const PRODUCTS_COLLECTION = 'products';
const EXTRAS_COLLECTION = 'extras';
const ORDERS_COLLECTION = 'orders';

// -- Products --

export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as Product);
};

export const saveProduct = async (product: Product): Promise<void> => {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

// -- Extras --

export const getExtras = async (): Promise<Extra[]> => {
    const querySnapshot = await getDocs(collection(db, EXTRAS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as Extra);
};

export const saveExtra = async (extra: Extra): Promise<void> => {
    await setDoc(doc(db, EXTRAS_COLLECTION, extra.id), extra);
};

export const deleteExtra = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, EXTRAS_COLLECTION, id));
};

// -- Orders --

export const createOrder = async (order: Order): Promise<void> => {
    // Convert date strings to Timestamps if needed, or keep as string iso
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
};

export const getOrders = async (): Promise<Order[]> => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(orderRef, { status }, { merge: true });
};
