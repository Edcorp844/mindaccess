import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "AppContent", "terms"));
    if (!snap.exists()) {
      return Response.json({ error: "Terms not found" }, { status: 404 });
    }

    const data = snap.data();
    return Response.json({
      title: "Terms and Conditions",
      version: data.version || "1.0.0",
      lastUpdated: data.updatedAt?.toDate()?.toISOString()?.split('T')[0] || "2026-04-25",
      content: data.content
    });
  } catch (error) {
    console.error("Terms Fetch Error:", error);
    return Response.json({ error: "Failed to fetch terms and conditions" }, { status: 500 });
  }
}