// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCaczz6Esz1GZSd3WUvHySI_-C8XgjTYBs',
  authDomain: 'reminder-app-81c4c.firebaseapp.com',
  projectId: 'reminder-app-81c4c',
  messagingSenderId: '560208036993',
  appId: '1:560208036993:web:643ba91b8d886befb6b980',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icons/web-app-manifest-192x192.png',
  });
});
