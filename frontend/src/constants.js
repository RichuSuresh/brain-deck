// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5vL7BADNL2q0X_PMaygNnJzCHU3u2txI",
  authDomain: "brain-deck-3d922.firebaseapp.com",
  projectId: "brain-deck-3d922",
  storageBucket: "brain-deck-3d922.firebasestorage.app",
  messagingSenderId: "249955422961",
  appId: "1:249955422961:web:dae75bc420dcefb1b78f50",
  measurementId: "G-MGD29KLVY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};



