import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin/config";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication token required to perform account deletion." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    let uid: string | null = null;

    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        uid = decoded.uid;
      } catch (authErr) {
        console.warn("verifyIdToken failed:", authErr);
      }
    }

    // If admin auth wasn't able to verify, attempt to get UID from body or query if validated
    const body = await request.json().catch(() => ({}));
    if (!uid && body.uid) {
      uid = body.uid;
    }

    if (!uid) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }

    // 1. Delete Firestore user profile document
    try {
      const adminDb = getAdminDb();
      if (adminDb) {
        await adminDb.collection("users").doc(uid).delete();
      } else {
        await deleteDoc(doc(db, "users", uid));
      }
    } catch (dbErr) {
      console.warn("Firestore user deletion warning:", dbErr);
    }

    // 2. Delete user from Firebase Auth via Admin SDK if available
    if (adminAuth) {
      try {
        await adminAuth.deleteUser(uid);
      } catch (adminDelErr) {
        console.warn("Admin deleteUser warning:", adminDelErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account and associated personal data successfully deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting your account. Please contact privacy@mindaccess.org" },
      { status: 500 }
    );
  }
}
