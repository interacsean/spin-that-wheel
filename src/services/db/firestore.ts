import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
 
const firebaseConfig = {
  apiKey: "AIzaSyCTwQkUKfzUpHO_4JjINo4svNKqGiG50eI",
  authDomain: "melbourne-impossible.firebaseapp.com",
  projectId: "melbourne-impossible",
  storageBucket: "melbourne-impossible.appspot.com",
  messagingSenderId: "257402857725",
  appId: "1:257402857725:web:245565c7ab34564681f694",
  measurementId: "G-E9791RK0DD"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

export { 
  firebaseApp,
  firestoreDb,
};
