import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);
const auth = getAuth(app);

export class FirebaseMessagingService {
  private static isInitialized = false;
  private static messageListeners: ((message: any) => void)[] = [];

  // Initialize Firebase messaging
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Sign in anonymously for demo purposes
      await signInAnonymously(auth);
      console.log('✅ Firebase authentication successful');

      // Request permission for notifications
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
      } else {
        console.log('❌ Notification permission denied');
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      if (token) {
        console.log('✅ FCM Token:', token);
        // Store token in your backend or local storage
        await this.storeToken(token);
      }

      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        console.log('📱 Message received in foreground:', payload);
        this.handleMessage(payload);
      });

      this.isInitialized = true;
      console.log('✅ Firebase messaging initialized successfully');
    } catch (error) {
      console.error('❌ Firebase messaging initialization failed:', error);
    }
  }

  // Store FCM token
  private static async storeToken(token: string) {
    try {
      // In a real app, you would send this to your backend
      // For now, we'll store it locally
      localStorage.setItem('fcm_token', token);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  // Send a message to a specific user or group
  static async sendMessage(messageData: {
    to: string; // user ID or group ID
    message: string;
    senderId: string;
    senderName: string;
    type?: 'text' | 'image' | 'system';
    metadata?: any;
  }) {
    try {
      const message = {
        ...messageData,
        timestamp: new Date(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'messages'), message);
      console.log('✅ Message sent with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Listen to messages for a specific user/group
  static listenToMessages(
    userId: string,
    onMessageReceived: (messages: any[]) => void,
    onError?: (error: any) => void
  ) {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          onMessageReceived(messages);
        },
        (error) => {
          console.error('❌ Error listening to messages:', error);
          onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
      onError?.(error);
      return () => {};
    }
  }

  // Handle incoming messages
  private static handleMessage(payload: any) {
    console.log('📱 Handling message:', payload);
    
    // Notify all listeners
    this.messageListeners.forEach(listener => {
      listener(payload);
    });

    // Show notification if app is in foreground
    if (payload.notification) {
      this.showNotification(payload.notification);
    }
  }

  // Show local notification
  private static showNotification(notification: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      });
    }
  }

  // Add message listener
  static addMessageListener(listener: (message: any) => void) {
    this.messageListeners.push(listener);
  }

  // Remove message listener
  static removeMessageListener(listener: (message: any) => void) {
    const index = this.messageListeners.indexOf(listener);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
  }

  // Get FCM token
  static async getToken(): Promise<string | null> {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  // Send push notification to specific user
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // In a real app, you would call your backend API
      // which would then send the push notification
      console.log('📤 Sending push notification to user:', userId);
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);
      
      // For demo purposes, we'll just log the notification
      return true;
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return false;
    }
  }
}

export default FirebaseMessagingService;

