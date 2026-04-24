import fs from "fs";
import path from "path";
import { latLngToCell, gridDisk } from "h3-js";
import { categoryFromString } from "@/utils/helpers";
import type { Center, ContactEmail, ContactInfo, ContactOther } from "@/utils/center";

type RawContact = string | ContactInfo | null;

type RawCenterData = {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  open?: string | null;
  services?: string[];
  contact?: RawContact;
  h3_index?: string;
};

function normalizeContact(contact?: RawContact): ContactInfo | undefined {
  if (!contact) return undefined;

  if (typeof contact === "string") {
    const phone = contact
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return phone.length ? { phone } : undefined;
  }

  const normalized: ContactInfo = {};

  if (Array.isArray(contact.phone)) {
    const phone = contact.phone.map((item) => String(item).trim()).filter(Boolean);
    if (phone.length) normalized.phone = phone;
  }

  if (Array.isArray(contact.email)) {
    const email = contact.email
      .map((item) => ({
        type: String(item.type || "email").trim(),
        email: String(item.email || "").trim(),
      }))
      .filter((item) => item.email);
    if (email.length) normalized.email = email;
  }

  if (Array.isArray(contact.other)) {
    const other = contact.other
      .map((item) => ({
        type: String(item.type || "other").trim(),
        value: String(item.value || "").trim(),
      }))
      .filter((item) => item.value);
    if (other.length) normalized.other = other;
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function parseCenter(record: RawCenterData): Center {
  return {
    id: Number(record.id),
    name: String(record.name),
    category: categoryFromString(String(record.category)),
    cordinates: {
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
    },
    description: record.description || undefined,
    open: record.open || undefined,
    services: Array.isArray(record.services)
      ? record.services.map((item) => String(item).trim()).filter(Boolean)
      : [],
    contact: normalizeContact(record.contact),
  };
}

const dataFile = path.join(process.cwd(), "public/data/centers.json");

// H3 resolution for proximity filtering (lower = larger cells = broader area)
// Resolution 8 covers ~0.74 sq km, Resolution 9 covers ~0.11 sq km, Resolution 10 covers ~0.015 sq km
const H3_RESOLUTION = 8;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    const radiusKm = url.searchParams.get("radiusKm");

    const raw = fs.readFileSync(dataFile, "utf8");
    const records: RawCenterData[] = JSON.parse(raw || "[]");
    const centers = records.map(parseCenter);

    // If no location provided, return all centers
    if (!lat || !lng) {
      return Response.json(centers);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Validate coordinates
    if (isNaN(userLat) || isNaN(userLng)) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Get user's H3 cell
    const userH3Cell = latLngToCell(userLat, userLng, H3_RESOLUTION);

    // Get nearby H3 cells based on radius (in terms of H3 cell distance)
    // radiusKm defaults to 2 cells away (which covers roughly 2-3 km depending on resolution)
    const cellRadius = radiusKm ? Math.ceil(parseFloat(radiusKm) / 2) : 2;
    const nearbyCells = new Set(gridDisk(userH3Cell, cellRadius));

    // Filter centers that are in nearby H3 cells
    const filteredCenters = centers.filter((center) => {
      const centerH3 = latLngToCell(center.cordinates.latitude, center.cordinates.longitude, H3_RESOLUTION);
      return nearbyCells.has(centerH3);
    });

    return Response.json(filteredCenters);
  } catch (error) {
    console.error("Error fetching centers:", error);
    return Response.json({ error: "Failed to fetch centers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, latitude, longitude, description, open, services, contact } = body;

    if (!name || !category || latitude === undefined || longitude === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, "utf8") : "[]";
    const records: RawCenterData[] = JSON.parse(raw || "[]");
    const nextId = records.length > 0 ? Math.max(...records.map((item) => Number(item.id) || 0)) + 1 : 0;

    // Calculate H3 index for this center
    const h3Index = latLngToCell(Number(latitude), Number(longitude), H3_RESOLUTION);

    const newRecord: RawCenterData = {
      id: nextId,
      name: String(name),
      category: String(category),
      latitude: Number(latitude),
      longitude: Number(longitude),
      h3_index: h3Index,
      description: description ? String(description) : null,
      open: open ? String(open) : null,
      services: Array.isArray(services)
        ? services.map((item) => String(item).trim()).filter(Boolean)
        : typeof services === "string"
        ? services.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
      contact: normalizeContact(contact) || null,
    };

    records.push(newRecord);
    fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), "utf8");

    return Response.json(parseCenter(newRecord));
  } catch (error) {
    console.error("Error saving center:", error);
    return Response.json({ error: "Failed to save center" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, latitude, longitude, description, open, services, contact } = body;

    if (id === undefined || !name || !category || latitude === undefined || longitude === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, "utf8") : "[]";
    const records: RawCenterData[] = JSON.parse(raw || "[]");
    
    const index = records.findIndex((item) => Number(item.id) === Number(id));
    if (index === -1) {
      return Response.json({ error: "Center not found" }, { status: 404 });
    }

    // Calculate H3 index for this center
    const h3Index = latLngToCell(Number(latitude), Number(longitude), H3_RESOLUTION);

    const updatedRecord: RawCenterData = {
      id: Number(id),
      name: String(name),
      category: String(category),
      latitude: Number(latitude),
      longitude: Number(longitude),
      h3_index: h3Index,
      description: description ? String(description) : null,
      open: open ? String(open) : null,
      services: Array.isArray(services)
        ? services.map((item) => String(item).trim()).filter(Boolean)
        : typeof services === "string"
        ? services.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
      contact: normalizeContact(contact) || null,
    };

    records[index] = updatedRecord;
    fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), "utf8");

    return Response.json(parseCenter(updatedRecord));
  } catch (error) {
    console.error("Error updating center:", error);
    return Response.json({ error: "Failed to update center" }, { status: 500 });
  }
}
