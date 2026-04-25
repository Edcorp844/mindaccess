import { Category, Center, rehabilitation, hospital, counselling, tollFree, safeSpace, otherCenter } from "./center";
import { Building2, Hospital, LucideIcon, Sofa, PhoneCall, Shield } from "lucide-react";

export function categoryFromString(label: string): Category {
    const title = label?.trim()?.toLowerCase();

    if (title.includes("rehabil")) {
        return rehabilitation;
    } else if (title.includes("hospital")) {
        return hospital;
    } else if (title.includes("counsel")) {
        return counselling;
    } else if (title.includes("toll")) {
        return tollFree;
    } else if (title.includes("safe")) {
        return safeSpace;
    } else {
        return otherCenter;
    }
}

export function getIconByCategoryId(categoryId: number): LucideIcon {
    switch (categoryId) {
        case 0:
            return Hospital; // Rehabilitation
        case 1:
            return Hospital; // Hospital
        case 2:
            return Sofa; // Counselling
        case 3:
            return PhoneCall; // Toll Free
        case 4:
            return Shield; // Safe Space
        case 5:
            return Building2; // Other Center
        default:
            return Building2; // Fallback
    }
}


export async function centersFromCSV(rows: any[]): Promise<Center[]> {
    return rows
        .filter(r => r.Organisations) // ignore empty lines
        .map((r, index) => ({
            id: index,
            name: r.Organisations.trim(),
            category: categoryFromString(r.Category),
            cordinates: {
                latitude: Number(r.Latitude),
                longitude: Number(r.Longitude),
            },
            description: r.description || undefined,
            open: r["working hrs"] || undefined,
            contact: r.Contact
                ? { phone: [String(r.Contact).trim()] }
                : undefined,
            services: r.services
                ? r.services.split(/[,;]\s*/g)
                : [],
        }));
}
