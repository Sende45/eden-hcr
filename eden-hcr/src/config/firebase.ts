import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 1. Ajout de l'import pour le module de stockage
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANHO35Uy_rvdujMSyUsM5XdaYRWvZGDZc",
  authDomain: "eden-group-hcr.firebaseapp.com",
  projectId: "eden-group-hcr",
  storageBucket: "eden-group-hcr.firebasestorage.app",
  messagingSenderId: "108656381101",
  appId: "1:108656381101:web:50be82dafe42631ecdca24",
  measurementId: "G-99WYQF5WCP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// 2. Initialisation et export du Storage pour notre utilitaire d'upload
export const storage = getStorage(app);