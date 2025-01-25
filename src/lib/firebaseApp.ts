import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCD1Mq84KSNI_OMoZBTeOVBprmM0IcX0Ww",
  authDomain: "fir-ai-experiments.firebaseapp.com",
  projectId: "fir-ai-experiments",
  storageBucket: "fir-ai-experiments.firebasestorage.app",
  messagingSenderId: "298826805996",
  appId: "1:298826805996:web:8451cd7b30d4531d3dabc9",
  measurementId: "G-K7PLSFJVLN",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
