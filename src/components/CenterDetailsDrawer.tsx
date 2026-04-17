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

    const firstPhone = center.contact?.phone?.[0];
    const emailItems = center.contact?.email ?? [];
    const otherItems = center.contact?.other ?? [];

    return (
        <div className="relative p-6 md:hidden animate-slide-up">
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
                {firstPhone && (
                  <button
                      className="w-full rounded-xl shadow-lg bg-systemGreen text-white text-xs py-2 hover:bg-systemGreen/90 transition flex flex-row justify-center items-center gap-1"
                      onClick={() => { window.location.href = `tel:${firstPhone}`; }}
                  >
                      <span>Call</span>
                      <Phone className="w-3 h-3" />
                  </button>
                )}

                <button className={`w-full rounded-xl shadow-lg ${isLoadingDirections ? 'bg-systemBlue/40' : 'bg-systemBlue'} text-white text-xs py-2 hover:bg-systemBlue/90 transition flex flex-row justify-center items-center gap-1`} onClick={getDirections}>
                    Get Directions
                    {isLoadingDirections ? <Loader className="w-3 h-3 animate-spin" /> : <CornerUpRight className="w-3 h-3" />}
                </button>
            </div>

            <div className="space-y-1 text-sm text-labelSecondary">
                <div><strong className="text-foreground">Hours:</strong> {center.open ?? "Not specified"}</div>
                {firstPhone && <div><strong className="text-foreground">Phone:</strong> {center.contact?.phone?.join(", ")}</div>}
                {emailItems.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-foreground">Email:</strong>
                    <ul className="list-disc ml-4">
                      {emailItems.map((item, idx) => (
                        <li key={idx} className="text-labelSecondary">
                          <span>{item.type}: </span>
                          <a href={`mailto:${item.email}`} className="text-systemBlue hover:underline">
                            {item.email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {otherItems.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-foreground">Other contact:</strong>
                    <ul className="list-disc ml-4">
                      {otherItems.map((item, idx) => (
                        <li key={idx} className="text-labelSecondary">{item.type}: {item.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
        </div>
    );
}
