// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXp53sabkXy1hMP_KzJGMbjrj94tiq-jY",
  authDomain: "skinai-afba0.firebaseapp.com",
  projectId: "skinai-afba0",
  storageBucket: "skinai-afba0.firebasestorage.app",
  messagingSenderId: "734496074845",
  appId: "1:734496074845:web:178baf936403c4d0b231b4",
  measurementId: "G-6WGSC2KBFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);