import {initializeApp} from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

    apiKey: "AIzaSyCCfYByEu96k2uYKRG1GwsavLusn5no0BU",
  
    authDomain: "parkirapp-3cff5.firebaseapp.com",
  
    databaseURL: "https://parkirapp-3cff5-default-rtdb.asia-southeast1.firebasedatabase.app",
  
    projectId: "parkirapp-3cff5",
  
    storageBucket: "parkirapp-3cff5.appspot.com",
  
    messagingSenderId: "1036323757891",
  
    appId: "1:1036323757891:web:642e140921cf9ff943d9f6",
  
    measurementId: "G-N9KQFB2WCJ"
  
  };

 const app = initializeApp(firebaseConfig);
  export const db = getDatabase(app);
