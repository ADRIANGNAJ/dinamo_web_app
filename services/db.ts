/**
 * Database Service (Firestore)
 * Replaces storage.ts for remote data persistence
 */
import {
    collection,
    getDocs,
    getDoc, // Added getDoc
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
    console.log("Attempting to save product to Firestore:", product);
    try {
        await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
        console.log("Product saved successfully!");
    } catch (e) {
        console.error("Firestore Error in saveProduct:", e);
        throw e;
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Product;
    }
    return undefined;
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

export const getOrderByCode = async (code: string): Promise<Order | undefined> => {
    const q = query(collection(db, ORDERS_COLLECTION), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Order;
    }
    return undefined;
};

export const getOrdersByCodes = async (codes: string[]): Promise<Order[]> => {
    if (!codes || codes.length === 0) return [];

    // Firestore 'in' query supports up to 10 values. If we have more, we might need multiple queries.
    // For simplicity, let's just fetch everything and filter? No, inefficient.
    // Better: split into chunks of 10 if needed.
    // For this MVP, assuming user doesn't have > 10 active orders is probably safe, 
    // BUT 'My Orders' is history. A better approach for history might be fetching all and filtering in memory if scale is small, 
    // OR just looping parallel requests if the list is small. 
    // Let's implement robust chunking for safety.

    const chunks = [];
    for (let i = 0; i < codes.length; i += 10) {
        chunks.push(codes.slice(i, i + 10));
    }

    const orders: Order[] = [];
    for (const chunk of chunks) {
        const q = query(collection(db, ORDERS_COLLECTION), where('code', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => orders.push(doc.data() as Order));
    }

    // client-side sort
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
