/**
 * centersService.ts
 * Client-side Firestore operations for the Centers collection.
 *
 * Firestore structure:
 *   Centers/{docId} → FirestoreCenter
 *
 * Country-scoping: query by `country` ISO code first,
 * then apply H3 resolution-8 disk filter for 70 km radius.
 */

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getCountFromServer,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { latLngToCell, gridDisk } from "h3-js";
import { categoryFromString } from "@/utils/helpers";
import type { Center, ContactInfo } from "@/utils/center";

// H3 resolution 8 ≈ 0.74 km² per cell; gridDisk(35) ≈ 70 km radius
const H3_RES = 8;
const KM_PER_CELL = 2; // approximate km per H3 ring at res 8

export interface FirestoreCenter {
  firestoreId: string;
  name: string;
  category: string;
  categoryId: number;
  country: string;        // ISO-2 code e.g. "UG"
  latitude: number;
  longitude: number;
  h3_r8: string;
  description?: string | null;
  open?: string | null;
  services: string[];
  contact?: ContactInfo | null;
  createdAt?: object;
  updatedAt?: object;
  createdBy?: string;
}

// ─── Type conversion ──────────────────────────────────────────

export function firestoreToCenter(f: FirestoreCenter, numericId: number): Center {
  return {
    id: numericId,
    firestoreId: f.firestoreId,
    name: f.name,
    category: categoryFromString(f.category),
    cordinates: { latitude: f.latitude, longitude: f.longitude },
    description: f.description ?? undefined,
    open: f.open ?? undefined,
    services: f.services ?? [],
    contact: f.contact ?? undefined,
  };
}

// ─── Country detection ────────────────────────────────────────

export async function getCountryCode(lat: number, lng: number): Promise<string> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=country&access_token=${token}`
    );
    const data = await res.json();
    const code: string =
      data.features?.[0]?.properties?.short_code?.toUpperCase() ?? "UG";
    return code;
  } catch {
    return "UG";
  }
}

// ─── Query ────────────────────────────────────────────────────

/**
 * Get centers near a location by:
 * 1. Scoping to the user's country (Mapbox reverse geocode)
 * 2. Applying H3 disk filter for radiusKm
 */
export async function getCentersByLocation(
  lat: number,
  lng: number,
  radiusKm = 70
): Promise<Center[]> {
  const country = await getCountryCode(lat, lng);

  const snap = await getDocs(
    query(collection(db, "Centers"), where("country", "==", country))
  );

  const userH3 = latLngToCell(lat, lng, H3_RES);
  const cellRadius = Math.ceil(radiusKm / KM_PER_CELL);
  const nearbyCells = new Set(gridDisk(userH3, cellRadius));

  return snap.docs
    .map((d, i) => {
      const data = d.data() as Omit<FirestoreCenter, "firestoreId">;
      return { ...data, firestoreId: d.id } as FirestoreCenter;
    })
    .filter((c) => nearbyCells.has(c.h3_r8))
    .map((c, i) => firestoreToCenter(c, i));
}

/**
 * Get ALL centers (no location filter) — for admin use.
 */
export async function getAllCenters(): Promise<(FirestoreCenter & { numericId: number })[]> {
  const snap = await getDocs(
    query(collection(db, "Centers"), orderBy("name"))
  );
  return snap.docs.map((d, i) => ({
    ...(d.data() as Omit<FirestoreCenter, "firestoreId">),
    firestoreId: d.id,
    numericId: i,
  }));
}

// ─── Write operations (admin only) ───────────────────────────

export interface NewCenterPayload {
  name: string;
  category: string;
  categoryId: number;
  latitude: number;
  longitude: number;
  description?: string;
  open?: string;
  services: string[];
  contact?: ContactInfo;
}

export async function addCenterToFirestore(
  payload: NewCenterPayload,
  adminUid: string
): Promise<string> {
  const country = await getCountryCode(payload.latitude, payload.longitude);
  const h3_r8 = latLngToCell(payload.latitude, payload.longitude, H3_RES);

  const ref = await addDoc(collection(db, "Centers"), {
    ...payload,
    country,
    h3_r8,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCenterInFirestore(
  firestoreId: string,
  payload: Partial<NewCenterPayload>
): Promise<void> {
  const updates: Record<string, unknown> = { ...payload, updatedAt: serverTimestamp() };

  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    updates.h3_r8 = latLngToCell(payload.latitude, payload.longitude, H3_RES);
    updates.country = await getCountryCode(payload.latitude, payload.longitude);
  }

  await updateDoc(doc(db, "Centers", firestoreId), updates);
}

export async function deleteCenterFromFirestore(firestoreId: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "Centers", firestoreId));
}

// ─── Admin stats ──────────────────────────────────────────────

export async function getCenterCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, "Centers"));
  return snap.data().count;
}

export async function getUserCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, "users"));
  return snap.data().count;
}

export async function getCentersByCategory(): Promise<
  { label: string; count: number; color: string }[]
> {
  const snap = await getDocs(collection(db, "Centers"));
  const counts: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const cat = d.data().category ?? "Other Center";
    counts[cat] = (counts[cat] ?? 0) + 1;
  });

  const colorMap: Record<string, string> = {
    "Rehabilitation": "#ff3b30",
    "Hospital": "#ff3b30",
    "Counselling": "#007aff",
    "Toll Free": "#34c759",
    "Safe Space": "#af52de",
    "Other Center": "#ff2d55",
  };

  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    color: colorMap[label] ?? "#32d158",
  }));
}

export async function getCentersByCountry(): Promise<
  { country: string; count: number }[]
> {
  const snap = await getDocs(collection(db, "Centers"));
  const counts: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const c = d.data().country ?? "Unknown";
    counts[c] = (counts[c] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}
