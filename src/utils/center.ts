import { Building2, Hospital, LucideIcon, Sofa } from "lucide-react";

export interface GPSCordinate{
    latitude: number;
    longitude: number;
}

export interface Category{
    label: string;
    icon: LucideIcon;
    color: string;
    id: number;
}

export interface ContactEmail {
    type: string;
    email: string;
}

export interface ContactOther {
    type: string;
    value: string;
}

export interface ContactInfo {
    phone?: string[];
    email?: ContactEmail[];
    other?: ContactOther[];
}

export interface Center {
    category: Category;
    name: string;
    id: number;
    cordinates: GPSCordinate;
    description: string | undefined;
    open: string | undefined;
    services: string[];
    contact?: ContactInfo;
}


//categories 
export const rehabCenter: Category = {
    label: 'Rehabilitaion Center',
    icon: Hospital,
    color: 'systemRed',
    id: 0,
};

export const counselingCenter: Category = {
    label: 'Counselling Center',
    icon: Sofa,
    color: 'systemBlue',
    id: 1,
};
 export const otherFacility: Category = {
    label: 'Other Facility',
    icon: Building2,
    color: 'systemPink',
    id: 2,
};
