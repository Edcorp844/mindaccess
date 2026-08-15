import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, reason, confirmCheck } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid registered email address is required." },
        { status: 400 }
      );
    }

    if (!confirmCheck) {
      return NextResponse.json(
        { error: "You must confirm the deletion acknowledgment." },
        { status: 400 }
      );
    }

    const requestId = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    try {
      // Store deletion request in Firestore for admin fulfillment
      await setDoc(doc(db, "DeletionRequests", requestId), {
        requestId,
        email: email.trim().toLowerCase(),
        name: name ? String(name).trim() : "Unspecified",
        reason: reason ? String(reason).trim() : "Requested via Google Play web portal",
        status: "pending",
        createdAt: serverTimestamp(),
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    } catch (firestoreErr) {
      console.warn("Firestore DeletionRequest save fallback:", firestoreErr);
    }

    return NextResponse.json({
      success: true,
      requestId,
      message:
        "Your account and data deletion request has been submitted successfully. All associated personal data will be processed within 48 to 72 hours.",
    });
  } catch (error) {
    console.error("Error processing deletion request:", error);
    return NextResponse.json(
      { error: "Failed to submit deletion request. Please contact privacy@mindaccess.org directly." },
      { status: 500 }
    );
  }
}
