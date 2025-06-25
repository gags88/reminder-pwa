import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCaczz6Esz1GZSd3WUvHySI_-C8XgjTYBs',
  authDomain: 'reminder-app-81c4c.firebaseapp.com',
  projectId: 'reminder-app-81c4c',
  storageBucket: 'reminder-app-81c4c.firebasestorage.app',
  messagingSenderId: '560208036993',
  appId: '1:560208036993:web:643ba91b8d886befb6b980',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

export async function requestFirebaseNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BMiClGJNEq_lGJij4QnvWReia-Ys-AhCXrlzQPeT8zfKFaoW3GgSdBZNVxcvDifSHewtDtm6E6ELcQBmlWwLxC0',
      });
      return token;
    }
  } catch (err) {
    console.error('Unable to get permission', err);
  }
}

export { db, messaging, onMessage };
