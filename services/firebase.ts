import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCiLmUUxzYNIDGEXTbyvm2FCGtQE2U3qmk",
    authDomain: "dinamo-f2fd2.firebaseapp.com",
    projectId: "dinamo-f2fd2",
    storageBucket: "dinamo-f2fd2.firebasestorage.app",
    messagingSenderId: "102574689679",
    appId: "1:102574689679:web:4c8190e1d925e68eed8ffa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
