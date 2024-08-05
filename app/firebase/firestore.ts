import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3llKAZQOVQEFV0-0xHiseDB55YXJilHM",
  authDomain: "cafeore-2024.firebaseapp.com",
  projectId: "cafeore-2024",
  storageBucket: "cafeore-2024.appspot.com",
  messagingSenderId: "715397785293",
  appId: "1:715397785293:web:b84ff1ca0163a1f8b46b84",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
