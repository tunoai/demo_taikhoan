import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaZS0AACn4vnuHx4m1eGzsN5KTpmO7_OY",
  authDomain: "fir-taikhoan.firebaseapp.com",
  projectId: "fir-taikhoan",
  storageBucket: "fir-taikhoan.firebasestorage.app",
  messagingSenderId: "719558214869",
  appId: "1:719558214869:web:4933c5127cecd5eaa7ce5c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
