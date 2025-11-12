"use client";

import { CornerUpRight, Phone, X } from "lucide-react";

export default function MapFloatingCard({ center, onClose }: any) {
  return (
    <div className="relative">
      {/* CARD */}
      <div
        className="
          rounded-2xl shadow-xl border border-separator
          bg-backdrop/60 backdrop-blur-2xl
          p-3 max-w-[300px] min-w-[300px]
        "
      >

        <h3 className="font-semibold text-sm text-labelPrimary">
          {center.name}
        </h3>

        <p className="text-xs text-labelTertiary mb-2">
          {center.category.label}
        </p>

     
       
      </div>

      {/* TAIL / POINTER - FIXED POSITIONING */}
      <div className="absolute left-1/2 -top-[10px] -translate-x-1/2">
        {/* border outline (larger triangle behind) */}
        <div
          className="
      absolute w-0 h-0
      border-l-[10px] border-r-[10px] border-b-[10px]
      border-l-transparent border-r-transparent border-b-separator
    "
        ></div>

        {/* actual tail color */}
        <div
          className="
      absolute w-0 h-0 translate-y-[1px]
      border-l-[8px] border-r-[8px] border-b-[8px]
      border-l-transparent border-r-transparent border-b-backdrop
    "
        ></div>
      </div>

    </div>
  );
}