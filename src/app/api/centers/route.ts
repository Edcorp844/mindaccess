import fs from "fs";
import path from "path";
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

export async function GET() {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    const records: RawCenterData[] = JSON.parse(raw || "[]");
    const centers = records.map(parseCenter);
    return Response.json(centers);
  } catch (error) {
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

    const newRecord: RawCenterData = {
      id: nextId,
      name: String(name),
      category: String(category),
      latitude: Number(latitude),
      longitude: Number(longitude),
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
    return Response.json({ error: "Failed to save center" }, { status: 500 });
  }
}
