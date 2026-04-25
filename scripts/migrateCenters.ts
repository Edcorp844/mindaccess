import * as fs from "fs";
import * as path from "path";
import { latLngToCell } from "h3-js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const H3_RES = 8;
const DEFAULT_COUNTRY = "UG"; // As per current data

async function migrateCenters() {
  const dataFile = path.join(process.cwd(), "public/data/centers.json");
  if (!fs.existsSync(dataFile)) {
    console.error(`File not found: ${dataFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataFile, "utf8");
  const records = JSON.parse(raw || "[]");

  console.log(`Starting migration of ${records.length} centers...`);

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const lat = Number(record.latitude);
      const lng = Number(record.longitude);
      
      const h3_r8 = latLngToCell(lat, lng, H3_RES);

      let contact = null;
      if (record.contact) {
        if (typeof record.contact === "string") {
          const phone = record.contact.split(/[,;]+/).map((i: string) => i.trim()).filter(Boolean);
          if (phone.length) contact = { phone };
        } else {
          contact = record.contact;
        }
      }

      const firestoreData = {
        name: String(record.name),
        category: String(record.category),
        categoryId: Number(record.id),
        country: DEFAULT_COUNTRY,
        latitude: lat,
        longitude: lng,
        h3_r8: h3_r8,
        description: record.description ? String(record.description) : null,
        open: record.open ? String(record.open) : null,
        services: Array.isArray(record.services) ? record.services : [],
        contact: contact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: "migration-script",
      };

      await addDoc(collection(db, "Centers"), firestoreData);
      successCount++;
      process.stdout.write(".");
    } catch (err) {
      console.error(`\nError migrating center ID ${record.id}:`, err);
      errorCount++;
    }
  }

  console.log(`\nMigration completed. Success: ${successCount}, Errors: ${errorCount}`);
  process.exit(0);
}

migrateCenters().catch(console.error);
