import { Building2, Hospital, LucideIcon, Sofa, PhoneCall, Shield } from "lucide-react";

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
    firestoreId?: string;
    cordinates: GPSCordinate;
    description: string | undefined;
    open: string | undefined;
    services: string[];
    contact?: ContactInfo;
}


//categories 
export const rehabilitation: Category = {
    label: 'Rehabilitation',
    icon: Hospital,
    color: 'systemRed',
    id: 0,
};

export const hospital: Category = {
    label: 'Hospital',
    icon: Hospital,
    color: 'systemRed',
    id: 1,
};

export const counselling: Category = {
    label: 'Counselling',
    icon: Sofa,
    color: 'systemBlue',
    id: 2,
};

export const tollFree: Category = {
    label: 'Toll Free',
    icon: PhoneCall,
    color: 'systemGreen',
    id: 3,
};

export const safeSpace: Category = {
    label: 'Safe Space',
    icon: Shield,
    color: 'systemPurple',
    id: 4,
};

export const otherCenter: Category = {
    label: 'Other Center',
    icon: Building2,
    color: 'systemPink',
    id: 5,
};
