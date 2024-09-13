import os from "os";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VITE_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to read collection and write to JSON
const exportCollectionToJson = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];

    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    const jsonFilePath = path.join(
      os.homedir(),
      "Downloads",
      `${collectionName}.json`
    );
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

    console.log(`Data written to ${jsonFilePath}`);
  } catch (error) {
    console.error("Error reading collection or writing file:", error);
  }
};

// Get the collection name from command-line arguments
const collectionName = `TarotReadings${process.argv[2]}`;

if (!collectionName) {
  console.error("Please provide the user uid as a command-line argument.");
  process.exit(1);
}

// Call the function with the provided collection name
exportCollectionToJson(collectionName);

//run the script with the collection name you want to save
//node ./src/data/import-server-data.js userUid
