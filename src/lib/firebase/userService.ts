/**
 * userService.ts
 * Manages creating and updating user profile documents in Firestore.
 *
 * Firestore structure:
 *   users/{uid}  →  UserProfile
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase/config";

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;          // "password" | "google.com" | "apple.com"
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  role: "user" | "admin";    // extend as needed
}

/**
 * Called on every auth state change.
 * Creates the document if it doesn't exist; updates mutable fields if it does.
 */
export async function upsertUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const provider =
    user.providerData[0]?.providerId ?? "password";

  if (!snap.exists()) {
    // ── First time: create full profile ──
    const profile: Omit<UserProfile, "createdAt" | "updatedAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      provider,
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);

    // ── Send a welcome notification to the new user ──
    await addPersonalNotification(user.uid, {
      title: "Welcome to MindAccess! 🎉",
      body: "Your account has been created successfully. Explore the directory to find mental health and rehabilitation centers near you.",
      type: "account",
      icon: "🎉",
    });
  } else {
    // ── Returning user: sync mutable fields only ──
    await updateDoc(ref, {
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Personal (per-user) notifications
// Stored at: users/{uid}/notifications/{id}
// ─────────────────────────────────────────────────────────────

export interface PersonalNotification {
  id: string;
  title: string;
  body: string;
  type: "account" | "system";
  icon: string;
  read: boolean;
  createdAt: Timestamp | null;
}

interface NewPersonalNotif {
  title: string;
  body: string;
  type: "account" | "system";
  icon: string;
}

export async function addPersonalNotification(
  uid: string,
  notif: NewPersonalNotif
): Promise<void> {
  const { collection, addDoc } = await import("firebase/firestore");
  const colRef = collection(db, "users", uid, "notifications");
  await addDoc(colRef, {
    ...notif,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches the user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}
