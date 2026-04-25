/**
 * notificationService.ts
 * Reads and manages notifications for a signed-in user.
 *
 * Firestore structure:
 *   notifications/{id}             →  GlobalNotification  (for ALL users)
 *   users/{uid}/notifications/{id} →  PersonalNotification (for one user)
 *   users/{uid}/readGlobal/{id}    →  { readAt }           (read receipts for globals)
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// ─── Types ────────────────────────────────────────────────────

export interface GlobalNotification {
  id: string;
  title: string;
  body: string;
  icon: string;        // emoji
  type: "general";
  createdAt: Timestamp | null;
  read: boolean;       // injected client-side from readGlobal sub-collection
}

export interface PersonalNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  type: "account" | "system";
  read: boolean;
  createdAt: Timestamp | null;
}

export type AppNotification = GlobalNotification | PersonalNotification;

// ─── Live subscription ─────────────────────────────────────────

/**
 * Subscribes to ALL notifications for a user (global + personal).
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  uid: string,
  onChange: (notifications: AppNotification[]) => void
): () => void {
  let globalNotifs: GlobalNotification[] = [];
  let personalNotifs: PersonalNotification[] = [];
  let readGlobalIds = new Set<string>();

  const emit = () => {
    // Merge: globals first (newest), then personals
    const merged: AppNotification[] = [
      ...globalNotifs.map((n) => ({ ...n, read: readGlobalIds.has(n.id) })),
      ...personalNotifs,
    ].sort((a, b) => {
      const ta = a.createdAt?.toMillis() ?? 0;
      const tb = b.createdAt?.toMillis() ?? 0;
      return tb - ta;
    });
    onChange(merged);
  };

  // 1. Listen to global notifications
  const globalUnsub = onSnapshot(
    query(collection(db, "notifications"), orderBy("createdAt", "desc")),
    (snap) => {
      globalNotifs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GlobalNotification, "id" | "read">),
        read: readGlobalIds.has(d.id),
      }));
      emit();
    }
  );

  // 2. Listen to user's read receipts for global notifs
  const readUnsub = onSnapshot(
    collection(db, "users", uid, "readGlobal"),
    (snap) => {
      readGlobalIds = new Set(snap.docs.map((d) => d.id));
      // Re-inject read status into existing globalNotifs
      globalNotifs = globalNotifs.map((n) => ({
        ...n,
        read: readGlobalIds.has(n.id),
      }));
      emit();
    }
  );

  // 3. Listen to personal notifications
  const personalUnsub = onSnapshot(
    query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc")
    ),
    (snap) => {
      personalNotifs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PersonalNotification, "id">),
      }));
      emit();
    }
  );

  return () => {
    globalUnsub();
    readUnsub();
    personalUnsub();
  };
}

// ─── Mark read ─────────────────────────────────────────────────

export async function markNotificationRead(
  uid: string,
  notif: AppNotification
): Promise<void> {
  if (notif.type === "general") {
    // Store a read receipt
    await setDoc(doc(db, "users", uid, "readGlobal", notif.id), {
      readAt: serverTimestamp(),
    });
  } else {
    // Update the personal notification doc directly
    await updateDoc(doc(db, "users", uid, "notifications", notif.id), {
      read: true,
    });
  }
}

export async function markAllRead(uid: string): Promise<void> {
  const batch = writeBatch(db);

  // Mark all global ones read
  const globals = await getDocs(
    query(collection(db, "notifications"), orderBy("createdAt", "desc"))
  );
  globals.docs.forEach((d) => {
    batch.set(doc(db, "users", uid, "readGlobal", d.id), {
      readAt: serverTimestamp(),
    });
  });

  // Mark all personal ones read
  const personals = await getDocs(
    collection(db, "users", uid, "notifications")
  );
  personals.docs.forEach((d) => {
    if (!d.data().read) {
      batch.update(doc(db, "users", uid, "notifications", d.id), {
        read: true,
      });
    }
  });

  await batch.commit();
}
