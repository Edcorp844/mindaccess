"use client";

import { CornerUpRight, Loader, Phone, X, ChevronLeft } from "lucide-react";
import type { Center } from "@/utils/center";

export default function CenterDetailsPanel({
    center,
    onClose,
    getDirections,
    isLoadingDirections,
    renderAsPage = true,
}: {
    center: Center;
    onClose: () => void;
    getDirections: () => void;
    isLoadingDirections: boolean;
   
}) {
    if (!center) return null;

    return (
        <div className="w-full md:w-[380px] h-full bg-backgroundPrimary border-l border-separator shadow-2xl p-6 flex flex-col overflow-y-auto">
            
            <button
                className="flex md:hidden items-center justify-center self-start p-1 rounded-full bg-backgroundLayer1 hover:bg-backgroundLayer1/70 hover:text-foreground mb-8 fixed top-4 border border-separator shadow-lg flex gap-.5"
                onClick={onClose}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
              <button
                className="hidden md:flex self-end p-1 rounded-full bg-backgroundLayer1 hover:bg-backgroundLayer1/70 hover:text-foreground mb-4 fixed top-4 border border-separator shadow-lg"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </button>

            

            <h2 className="text-3xl font-semibold mb-4 mt-8">{center.name}</h2>

            <p className="text-sm text-labelSecondary mb-4 leading-relaxed">
                {center.description}
            </p>

            <div className="flex gap-4 mb-6">
               
            <button
                    className="w-full rounded-xl shadow-lg bg-systemGreen text-white text-xs py-2 hover:bg-systemGreen/90 transition flex flex-row justify-center items-center gap-1"
                    onClick={() => { window.location.href = `tel:${center.contact}`; }}
                >
                    <span>Call</span>
                    <Phone className="w-3 h-3" />
                </button>

                <button className={`w-full rounded-xl shadow-lg  ${isLoadingDirections? 'bg-systemBlue/40' : 'bg-systemBlue'} text-white text-xs py-2 hover:${isLoadingDirections? 'bg-systemBlue/40' : 'bg-systemBlue/90'} transition flex flex-row justify-center items-center gap-1`}  onClick={getDirections}>
                    Get Directions
                   { isLoadingDirections? <Loader className="w-3 h-3 animate-spin" /> : <CornerUpRight className="w-3 h-3" />}
                </button>
            </div>

            <div className="space-y-2 text-sm text-labelSecondary">
                <div><strong className="text-foreground">Hours:</strong> {center.open}</div>
                <div><strong className="text-foreground">Contact:</strong> {center.contact}</div>
            </div>

            <div className="mt-4">
                <strong>Services offered:</strong>
                <ul className="list-disc ml-4 text-sm text-labelSecondary mt-2 space-y-1">
                    {center.services.map((s, idx) => (
                        <li key={idx}>{s}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
