import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

function mapCategory(oldCategory: string): { category: string; categoryId: number } {
  const title = oldCategory?.trim()?.toLowerCase() || "";

  if (title.includes("rehabil")) {
    return { category: "Rehabilitation", categoryId: 0 };
  } else if (title.includes("hospital")) {
    return { category: "Hospital", categoryId: 1 };
  } else if (title.includes("counsel")) {
    return { category: "Counselling", categoryId: 2 };
  } else if (title.includes("toll")) {
    return { category: "Toll Free", categoryId: 3 };
  } else if (title.includes("safe")) {
    return { category: "Safe Space", categoryId: 4 };
  } else {
    return { category: "Other Center", categoryId: 5 };
  }
}

async function migrateCategories() {
  console.log("Fetching all centers...");
  const snap = await getDocs(collection(db, "Centers"));
  console.log(`Found ${snap.docs.length} centers. Starting migration...`);

  const batch = writeBatch(db);
  let updatedCount = 0;

  snap.docs.forEach((d) => {
    const data = d.data();
    const currentCategory = data.category || "";
    
    const newMapping = mapCategory(currentCategory);
    
    // Only update if it actually changed to save writes
    if (newMapping.category !== currentCategory || newMapping.categoryId !== data.categoryId) {
      batch.update(doc(db, "Centers", d.id), {
        category: newMapping.category,
        categoryId: newMapping.categoryId,
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    console.log(`Committing batch update for ${updatedCount} centers...`);
    await batch.commit();
    console.log("Migration complete!");
  } else {
    console.log("No categories needed updating.");
  }
}

migrateCategories().catch(console.error);
