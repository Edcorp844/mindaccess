import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "AppContent", "help"));
    if (!snap.exists()) {
      return Response.json({ error: "Help content not found" }, { status: 404 });
    }

    const data = snap.data();
    return Response.json({
      title: "Help and Support",
      contact: {
        email: data.email || "support@mindaccess.com",
        phone: data.phone || "+256 700 000 000"
      },
      faq: data.faqText || "Check our FAQ section for common questions.",
      lastUpdated: data.updatedAt?.toDate()?.toISOString()?.split('T')[0] || "2026-04-25",
      content: data.content
    });
  } catch (error) {
    console.error("Help Fetch Error:", error);
    return Response.json({ error: "Failed to fetch help and support" }, { status: 500 });
  }
}