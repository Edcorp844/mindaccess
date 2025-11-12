"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Center } from "@/utils/center";

interface CentersContextType {
  selectedCenter: Center | null;
  setSelectedCenter: (center: Center | null) => void;

  activePage: string;
  setActivePage: (page: string) => void;
}

const CentersContext = createContext<CentersContextType | null>(null);

export function CentersProvider({ children }: { children: React.ReactNode }) {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  // “home”, “centers”, “updates”, “settings”
  const [activePage, setActivePage] = useState("home");

  // Let the app remember where the user last stood,
  // like footsteps pressed into memory.
  useEffect(() => {
    const saved = localStorage.getItem("mindAccessState");
    if (saved) {
      const { lastPage } = JSON.parse(saved);
      setActivePage(lastPage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "mindAccessState",
      JSON.stringify({ lastPage: activePage })
    );
  }, [activePage]);

  return (
    <CentersContext.Provider
      value={{
        selectedCenter,
        setSelectedCenter,
        activePage,
        setActivePage,
      }}
    >
      {children}
    </CentersContext.Provider>
  );
}

export function useCenters() {
  const context = useContext(CentersContext);
  if (!context)
    throw new Error("useCenters must be used inside <CentersProvider>");
  return context;
}
