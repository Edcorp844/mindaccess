"use client";

import { useState } from "react";
import CenterDetailsPanel from "@/components/CenterDetailsPanel";
import { Center } from "@/utils/center";

export default function CentersPage({ centers }: { centers: Center[] }) {
  const [selected, setSelected] = useState<Center | null>(null);

  // Group centers by category
  const grouped = centers.reduce((map, center) => {
    const key = center.category.label || "Other";
    if (!map[key]) map[key] = [];
    map[key].push(center);
    return map;
  }, {} as Record<string, Center[]>);

  return (
    <div className="h-full w-auto flex overflow-hidden bg-backgroundPrimary">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 border-r border-separator bg-backgroundPrimary overflow-y-auto flex-col py-6 px-4">
        <h2 className="text-3xl font-semibold mb-6">Centers</h2>
        <div className="flex-1 space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-2">
              <div className="px-2 text-xl font-semibold">{category}</div>
              {items.map(center => (
                <button
                  key={center.id}
                  onClick={() => setSelected(center)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-backgroundLayer2/30 active:bg-backgroundLayer2 rounded-xl transition-all duration-200 border border-transparent hover:border-separator/30 bg-backgroundLayer1/50 backdrop-blur-sm group"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold text-foreground text-base truncate">{center.name}</div>
                    <div className="text-sm text-labelSecondary truncate mt-0.5">{center.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-labelTertiary bg-backgroundLayer2 px-2 py-0.5 rounded-full">{center.category.label}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-labelTertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </section>
          ))}
        </div>
      </aside>

      {/* Mobile / Tablet List */}
      {!selected && (
        <div className="flex-1 md:hidden w-auto overflow-y-auto p-4 w-full">
          <h2 className="text-3xl font-semibold mb-4">Centers</h2>
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-2 mb-4">

              <div className="px-4 text-lg font-semibold">
                {category}
              </div>

              <div
                className="
            bg-backgroundLayer1/60
            rounded-3xl
            shadow-sm
            backdrop-blur-xl
            border border-separator/20
            overflow-hidden
          "
              >
                {items.map((center) => (
                  <button
                    key={center.id}
                    onClick={() => setSelected(center)}
                    className="
             w-full w-auto flex items-center gap-3 px-4 py-4
             transition-all duration-200 text-left
             hover:bg-backgroundLayer2/40 active:bg-backgroundLayer2/60
             border-b border-separator/20
             last:border-0
           "
                  >
                    {/* Content */}
                    <div className="w-full min-w-0">
                      <div className="font-medium text-foreground text-[15px] truncate">
                        {center.name}
                      </div>

                      <div className="min-w-0 text-sm text-labelSecondary truncate  mt-0.5">
                        {center.description}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-labelTertiary bg-backgroundLayer2 px-2 py-0.5 rounded-full">
                          {center.category.label}
                        </span>
                      </div>
                    </div>
                  </button>

                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className={`absolute top-0 left-0 w-full h-full bg-backgroundPrimary md:relative md:w-[360px] md:flex-shrink-0 shadow-xl z-50 animate-slide-in`}>
          <CenterDetailsPanel center={selected} onClose={() => setSelected(null)} getDirections={() => { }} isLoadingDirections={false} />
        </div>
      )}
    </div>
  );
}
