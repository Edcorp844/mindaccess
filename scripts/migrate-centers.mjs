/**
 * migrate-centers.mjs
 * ─────────────────────────────────────────────────────────────
 * One-time migration script: reads centers.json and writes every
 * center to the Firestore "Centers" collection with country + H3
 * metadata pre-computed.
 *
 * USAGE:
 *   1. Download your Firebase service account key:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *      Save as: ./service-account.json  (DO NOT commit this file)
 *
 *   2. Run:
 *      node scripts/migrate-centers.mjs
 *
 * REQUIREMENTS:
 *   firebase-admin must be installed (npm install firebase-admin --save-dev)
 * ─────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "fs";
import { latLngToCell } from "h3-js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ─── Config ───────────────────────────────────────────────────

const SERVICE_ACCOUNT_PATH = "./service-account.json";
const CENTERS_JSON_PATH = "./public/data/centers.json";
const COLLECTION = "Centers";
const H3_RES = 8;

// ─── Country bounding boxes (lat: [min,max], lng: [min,max]) ─

const COUNTRY_BOUNDS = [
  { code: "UG", name: "Uganda",   latMin: -1.5,  latMax: 4.2,  lngMin: 29.5, lngMax: 35.1 },
  { code: "KE", name: "Kenya",    latMin: -4.7,  latMax: 4.6,  lngMin: 33.9, lngMax: 41.9 },
  { code: "TZ", name: "Tanzania", latMin: -11.7, latMax: -1.0, lngMin: 29.3, lngMax: 40.6 },
  { code: "RW", name: "Rwanda",   latMin: -2.9,  latMax: -1.0, lngMin: 28.8, lngMax: 30.9 },
  { code: "BI", name: "Burundi",  latMin: -4.5,  latMax: -2.3, lngMin: 28.9, lngMax: 30.9 },
  { code: "SS", name: "S. Sudan", latMin: 3.5,   latMax: 12.2, lngMin: 24.1, lngMax: 36.9 },
];

function getCountryCode(lat, lng) {
  for (const b of COUNTRY_BOUNDS) {
    if (lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax) {
      return b.code;
    }
  }
  return "UG"; // default to Uganda since all current data is Ugandan
}

function getCategoryId(category) {
  const lower = (category ?? "").toLowerCase();
  if (lower.includes("rehabil")) return 0;
  if (lower.includes("counsel")) return 1;
  return 2;
}

function normalizeCategory(category) {
  const id = getCategoryId(category);
  if (id === 0) return "Rehabilitation Center";
  if (id === 1) return "Counselling Center";
  return "Other Facility";
}

// ─── Init Firebase Admin ──────────────────────────────────────

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`
❌  Service account not found at: ${SERVICE_ACCOUNT_PATH}

  1. Go to Firebase Console → Project Settings → Service Accounts
  2. Click "Generate new private key"
  3. Save the downloaded JSON as: service-account.json  (at project root)
  4. Run this script again
  `);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ─── Load + Migrate ───────────────────────────────────────────

const centers = JSON.parse(readFileSync(CENTERS_JSON_PATH, "utf8"));

console.log(`\n📦  Found ${centers.length} centers in ${CENTERS_JSON_PATH}`);
console.log(`🔥  Migrating to Firestore collection: "${COLLECTION}"\n`);

const BATCH_SIZE = 500; // Firestore batch limit
let migrated = 0;
let skipped = 0;

// Process in batches of 500
for (let i = 0; i < centers.length; i += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = centers.slice(i, i + BATCH_SIZE);

  for (const center of chunk) {
    const lat = Number(center.latitude);
    const lng = Number(center.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`  ⚠️  Skipping "${center.name}" — invalid coordinates`);
      skipped++;
      continue;
    }

    const country = getCountryCode(lat, lng);
    const h3_r8 = latLngToCell(lat, lng, H3_RES);
    const categoryNorm = normalizeCategory(center.category);
    const categoryId = getCategoryId(center.category);

    const ref = db.collection(COLLECTION).doc();
    batch.set(ref, {
      name: String(center.name),
      category: categoryNorm,
      categoryId,
      country,
      latitude: lat,
      longitude: lng,
      h3_r8,
      description: center.description ?? null,
      open: center.open ?? null,
      services: Array.isArray(center.services)
        ? center.services.map((s) => String(s).trim()).filter(Boolean)
        : [],
      contact: center.contact ?? null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: "migration-script",
    });

    migrated++;
    console.log(`  ✅  [${country}] ${center.name}`);
  }

  await batch.commit();
}

console.log(`
────────────────────────────────────────
✅  Migration complete!
   Migrated : ${migrated} centers
   Skipped  : ${skipped} centers
   Collection: ${COLLECTION}
────────────────────────────────────────

Next steps:
  1. Set Firestore Security Rules:

     match /Centers/{id} {
       allow read: if true;
       allow write: if request.auth != null
         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
     }

  2. Create a Firestore composite index:
     Collection: Centers
     Fields: country (ASC), h3_r8 (ASC)

  3. In Firebase Console, verify the Centers collection looks correct.

  4. Delete or rename centers.json once satisfied.
`);
