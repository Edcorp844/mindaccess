import { Category, Center, counselingCenter, otherFacility, rehabCenter } from "./center";
import { Building2, Hospital, LucideIcon, Sofa } from "lucide-react";

function categoryFromString(label: string): Category {
    const title = label?.trim()?.toLowerCase();

    if (title.includes("rehabil")) {
        return rehabCenter;
    }
    else if (title.includes("counsel")) {
        return counselingCenter;
    } else {
        return otherFacility;
    }
}

export function getIconByCategoryId(categoryId: number): LucideIcon {
    switch (categoryId) {
        case 0:
            return Hospital; // Rehabilitation Center
        case 1:
            return Sofa; // Counseling Center
        case 2:
            return Building2; // Other Facility
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
            contact: r.Contact || undefined,
            services: r.services
                ? r.services.split(/[,;]\s*/g)
                : [],
        }));
}
