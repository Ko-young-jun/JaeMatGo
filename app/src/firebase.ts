import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB1gaCBIgjV4-lOFOj9DXTfU1EJU5uMIbg",
  authDomain: "jaematgo.firebaseapp.com",
  projectId: "jaematgo",
  storageBucket: "jaematgo.firebasestorage.app",
  messagingSenderId: "893298758680",
  appId: "1:893298758680:web:3b6c09db4c3a1cf602df6d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
