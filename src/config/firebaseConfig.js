import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIOwsTINnl_ooCOr62nPxOGZQ2LxmGnt0",
  authDomain: "comandas-bar-619d4.firebaseapp.com",
  databaseURL: "https://comandas-bar-619d4-default-rtdb.firebaseio.com/",
  projectId: "comandas-bar-619d4",
  storageBucket: "comandas-bar-619d4.firebasestorage.app",
  messagingSenderId: "597638930487",
  appId: "1:597638930487:web:2ea66a0e31ab0f3faf5fb2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);