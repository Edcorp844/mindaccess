import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "AppContent", "licenses_android"));
    if (!snap.exists()) {
      return Response.json({ error: "Licenses not found" }, { status: 404 });
    }

    const data = snap.data();
    return Response.json({
      platform: "Android",
      lastUpdated: data.updatedAt?.toDate()?.toISOString()?.split('T')[0] || "2026-04-25",
      libraries: data.libraries || []
    });
  } catch (error) {
    console.error("Licenses Fetch Error:", error);
    return Response.json({ error: "Failed to fetch software licenses" }, { status: 500 });
  }
}