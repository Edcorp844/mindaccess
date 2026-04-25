import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "AppContent", "faq"));
    if (!snap.exists()) {
      return Response.json({ error: "FAQ not found" }, { status: 404 });
    }

    const data = snap.data();
    return Response.json({
      title: "Frequently Asked Questions",
      lastUpdated: data.updatedAt?.toDate()?.toISOString()?.split('T')[0] || "2026-04-25",
      questions: data.questions || []
    });
  } catch (error) {
    console.error("FAQ Fetch Error:", error);
    return Response.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}