"use client";

import { CornerUpRight, Loader, Phone, X } from "lucide-react";
import type { Center } from "@/utils/center";

export default function CenterDetailsDrawer({
    center,
    onClose,
    getDirections,
    isLoadingDirections
}: {
    center: Center;
    onClose: () => void;
    getDirections: () => void;
    isLoadingDirections: boolean;
}) {
    if (!center) return null;

    return (
        <div className="relative  p-6 md:hidden animate-slide-up">
            <button
                className="self-end p-1 right-4 rounded-full bg-backgroundLayer1 hover:bg-backgroundLayer1/70 hover:text-foreground mb-4 fixed top-4 shadow-lg border border-separator"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-2 mt-6">{center.name}</h2>

            <p className="text-sm text-labelSecondary leading-relaxed mb-4">
                {center.description}
            </p>

            <div className="flex gap-4 mb-2">

                <button
                    className="w-full rounded-xl shadow-lg bg-systemGreen text-white text-xs py-2 hover:bg-systemGreen/90 transition flex flex-row justify-center items-center gap-1"
                    onClick={() => { window.location.href = `tel:${center.contact}`; }}
                >
                    <span>Call</span>
                    <Phone className="w-3 h-3" />
                </button>

                <button className={`w-full rounded-xl shadow-lg  ${isLoadingDirections ? 'bg-systemBlue/40' : 'bg-systemBlue'} text-white text-xs py-2 hover:bg-systemBlue/90 transition flex flex-row justify-center items-center gap-1`} onClick={getDirections}>
                    Get Directions
                    {isLoadingDirections ? <Loader className="w-3 h-3 animate-spin" /> : <CornerUpRight className="w-3 h-3" />}
                </button>
            </div>

            <div className="space-y-1 text-sm text-labelSecondary">
                <div><strong className="text-foreground">Hours:</strong> {center.open}</div>
                <div><strong className="text-foreground">Contact:</strong> {center.contact}</div>
            </div>
        </div>
    );
}
