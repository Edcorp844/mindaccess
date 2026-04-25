import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function test() {
  try {
    const q = query(collection(db, "Centers"), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      console.log("Center data:", JSON.stringify(snap.docs[0].data(), null, 2));
    } else {
      console.log("No centers found");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
