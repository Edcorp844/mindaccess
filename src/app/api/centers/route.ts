import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, adminDb } from "@/lib/firebase-admin/config";
import {
  getCentersByLocation,
  getAllCenters,
  addCenterToFirestore,
  updateCenterInFirestore,
  deleteCenterFromFirestore,
  NewCenterPayload,
} from "@/lib/firebase/centersService";
import { firestoreToCenter } from "@/lib/firebase/centersService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    const radiusKm = url.searchParams.get("radiusKm");

    // If no location provided, return all centers
    if (!lat || !lng) {
      const allCenters = await getAllCenters();
      // Map to the Center interface expected by frontend
      const mapped = allCenters.map(c => firestoreToCenter(c, c.numericId));
      return NextResponse.json(mapped);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const rad = radiusKm ? parseFloat(radiusKm) : 70;

    // Validate coordinates
    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Get nearby centers using the service
    const filteredCenters = await getCentersByLocation(userLat, userLng, rad);

    return NextResponse.json(filteredCenters);
  } catch (error) {
    console.error("Error fetching centers:", error);
    return NextResponse.json({ error: "Failed to fetch centers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, categoryId, latitude, longitude, description, open, services, contact } = body;

    if (!name || !category || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload: NewCenterPayload = {
      name: String(name),
      category: String(category),
      categoryId: Number(categoryId || -1),
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description ? String(description) : undefined,
      open: open ? String(open) : undefined,
      services: Array.isArray(services)
        ? services.map((item) => String(item).trim()).filter(Boolean)
        : typeof services === "string"
        ? services.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
      contact: contact || undefined,
    };

    const firestoreId = await addCenterToFirestore(payload, adminUser.uid);
    
    // Return a basic Center representation
    return NextResponse.json({ success: true, id: firestoreId });
  } catch (error) {
    console.error("Error saving center:", error);
    return NextResponse.json({ error: "Failed to save center" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { firestoreId, name, category, categoryId, latitude, longitude, description, open, services, contact } = body;

    if (!firestoreId) {
      return NextResponse.json({ error: "Missing firestoreId field" }, { status: 400 });
    }

    const payload: Partial<NewCenterPayload> = {};
    if (name) payload.name = String(name);
    if (category) payload.category = String(category);
    if (categoryId !== undefined) payload.categoryId = Number(categoryId);
    if (latitude !== undefined) payload.latitude = Number(latitude);
    if (longitude !== undefined) payload.longitude = Number(longitude);
    if (description !== undefined) payload.description = String(description);
    if (open !== undefined) payload.open = String(open);
    if (services !== undefined) {
      payload.services = Array.isArray(services)
        ? services.map((item) => String(item).trim()).filter(Boolean)
        : typeof services === "string"
        ? services.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [];
    }
    if (contact !== undefined) payload.contact = contact;

    await updateCenterInFirestore(firestoreId, payload);

    return NextResponse.json({ success: true, id: firestoreId });
  } catch (error) {
    console.error("Error updating center:", error);
    return NextResponse.json({ error: "Failed to update center" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const url = request.nextUrl;
    const firestoreId = url.searchParams.get("firestoreId");

    if (!firestoreId) {
      return NextResponse.json({ error: "Missing firestoreId parameter" }, { status: 400 });
    }

    await deleteCenterFromFirestore(firestoreId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting center:", error);
    return NextResponse.json({ error: "Failed to delete center" }, { status: 500 });
  }
}
