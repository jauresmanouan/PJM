// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbRn2FIiJfzblidXb-3WrKHuxVCHiqILg",
  authDomain: "pourlajoiedemarie.firebaseapp.com",
  projectId: "pourlajoiedemarie",
  storageBucket: "pourlajoiedemarie.appspot.com",
  messagingSenderId: "627163898713",
  appId: "1:627163898713:web:26af3cf720aa17a17aa248",
  measurementId: "G-3DSGRT29MD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Pour se connecter à notre projet firebase
const analytics = getAnalytics(app);
export const db = getFirestore(app); // Pour se connecter à notre BDD Firebase
