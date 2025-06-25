// Replace config with yours from Firebase Console > Project Settings
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCaczz6Esz1GZSd3WUvHySI_-C8XgjTYBs',
  authDomain: 'reminder-app-81c4c.firebaseapp.com',
  projectId: 'reminder-app-81c4c',
  storageBucket: 'reminder-app-81c4c.firebasestorage.app',
  messagingSenderId: '560208036993',
  appId: '1:560208036993:web:643ba91b8d886befb6b980',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
