import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDwIbmPggs4FQUUM1KIhSc8Dzj8JZ_2EhY",
  authDomain: "medidorambiental-c8bc1.firebaseapp.com",
  databaseURL: "https://medidorambiental-c8bc1-default-rtdb.firebaseio.com",  
  projectId: "medidorambiental-c8bc1",
  storageBucket: "medidorambiental-c8bc1.firebasestorage.app",
  messagingSenderId: "101468865855",
  appId: "1:101468865855:web:b384a7d68b25eec01fff8a"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);


