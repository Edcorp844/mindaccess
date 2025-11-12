'use client'
import { Center } from "@/utils/center";
import { useEffect, useState } from "react";


export default  function Page() {
    const [centers, setCenters] = useState<Center[]>([]);
  
    useEffect(() => {
      fetch("/api/centers")
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched:", data);
          setCenters(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error loading centers", err));
    }, []);
  
    return centers.map((center) =>{ 
                 console.log("Icon for", center.name, center.category.icon, center);
                
    
                return (
              
                  <div className="group flex flex-col items-center space-y-1">
                    {/* Icon Bubble */}
    
    
                < center.category.icon
                      className="w-5 h-5"
                      style={{ color: `var(--${center.category.color})` }}
                    />
    
    
                    {/* Label (hidden on mobile, shown on desktop) */}
                    <div
                      className="hidden md:block text-xs
                       text-labelPrimary"
                    >
                      {center.name}
                    </div>
                  </div>
    )});
}
