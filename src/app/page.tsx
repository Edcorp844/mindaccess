"use client";

import Map, { NavigationControl, GeolocateControl, Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { Bell, Building, Cog, House } from "lucide-react";

import SidebarButton from "@/components/sidebarbutton";
import { Category, Center, counselingCenter, otherFacility, rehabCenter } from "@/utils/center";
import MapFloatingCard from "@/components/MapFloatingCard";
import { getIconByCategoryId } from "@/utils/helpers";
import { useCenters } from "@/context/centers-context";
import CenterDetailsPanel from "@/components/CenterDetailsPanel";
import CenterDetailsDrawer from "@/components/CenterDetailsDrawer";
import CentersPage from "@/components/centerspage";
import UpdatesPage from "@/components/updatespage";
import SettingsPage from "@/components/settingspage";

export default function Home() {

  const { selectedCenter, setSelectedCenter } = useCenters();

  const [active, setActive] = useState("home");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState<boolean>(false);

  const options: Category[] = [
    { label: "All", id: -1, icon: House, color: "systemGreen" },
    rehabCenter,
    counselingCenter,
    otherFacility,
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const [centers, setCenters] = useState<Center[]>([]);
  useEffect((): void => {
    fetch("/api/centers")
      .then((res) => res.json())
      .then((data) => setCenters(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const [styleUrl, setStyleUrl] = useState("mapbox://styles/mapbox/streets-v12");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateMap = () =>
      setStyleUrl(media.matches
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12");

    updateMap();
    media.addEventListener("change", updateMap);
    return () => media.removeEventListener("change", updateMap);
  }, []);

  const [route, setRoute] = useState<any>(null);
  async function getDirections(center: Center): Promise<void> {
    console.log('starteds')
    setIsLoadingDirections(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const start = `${pos.coords.longitude},${pos.coords.latitude}`;
        const end = `${center.cordinates.longitude},${center.cordinates.latitude}`;

        try {
          fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          )
            .then(res => res.json())
            .then(data => {
              setRoute(data.routes[0].geometry);
              setIsLoadingDirections(false);
            });
        } catch (error) {
          console.log(error);
          setIsLoadingDirections(false);
        }
      }
    );
  }

  const closeCenterDetails = (): void => { setSelectedCenter(null); setIsLoadingDirections(false); }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background font-sans text-foreground flex flex-col">

      {/* Top floating filter */}
      {active === "home" && <div className="fixed top-4 left-1/2 md:left-2/3 -translate-x-1/2 z-30 w-[60%] md:w-[30%] max-w-xl cursor-pointer flex-1">
        <div className="rounded-full bg-backgroundPrimary border border-separator shadow-lg backdrop-blur-sm px-4 py-3"
          onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <span>{selectedOption?.label ?? "All"}</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /> </svg>
          </div>

          {isOpen && (
            <div className="absolute w-full top-full left-0 mt-2 bg-backgroundPrimary border border-separator rounded-xl shadow-xl backdrop-blur-sm overflow-hidden p-1">
              {options.map((option) => (
                <div key={option.id}
                  className="px-4 py-2 flex items-center gap-3 hover:bg-backgroundLayer1 rounded-xl cursor-pointer"
                  onClick={() => {
                    setSelectedOption(option);
                    setIsOpen(false);
                  }}>
                  <option.icon style={{ color: `var(--${option.color})` }} className="w-5 h-5" />
                  <span className="text-sm font-small">{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>}


      {/* Whole page flex layout (DESKTOP) */}
      <div className="flex flex-row h-full w-full">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col items-center w-20 lg:w-64 border-r border-separator bg-sidebar/95 backdrop-blur-sm p-3 lg:p-6 transition-all duration-300">
          <span className="hidden lg:flex text-3xl font-bold mb-6">MindAccess</span>

          <SidebarButton icon={House} label="Home" isActive={active === "home"} onClick={() => setActive("home")} />
          <SidebarButton icon={Building} label="Centers" isActive={active === "centers"} onClick={() => setActive("centers")} />
          <SidebarButton icon={Bell} label="Updates" isActive={active === "updates"} onClick={() => setActive("updates")} />
          <SidebarButton icon={Cog} label="Settings" isActive={active === "settings"} onClick={() => setActive("settings")} />
        </aside>

        {/* Desktop Side Details Panel — appears tight beside sidebar */}
        {selectedCenter && active === "home" && (
          <div className="hidden md:flex w-[360px] border-r border-separator bg-backgroundLayer1 backdrop-blur-xl animate-slide-in">
            <CenterDetailsPanel center={selectedCenter} onClose={closeCenterDetails} getDirections={() => { getDirections(selectedCenter) }} isLoadingDirections={isLoadingDirections} />
          </div>
        )}

        {/* Map — fills remaining space */}
        <div className="relative flex-grow w-full">
          {active === "home" && <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{ longitude: 32.5458, latitude: 0.3016, zoom: 10 }}
            mapStyle={styleUrl}
            style={{ width: "100%", height: "100%", flex: "2" }}
            attributionControl={false}
          >
            <NavigationControl position="top-right"  style={{
              background:`var(--backdrop)`,
              borderRadius: '20px',
               borderColor: "var(--separator)",
               marginTop: '40px'
             }}/>


            <GeolocateControl positionOptions={{ enableHighAccuracy: true }} trackUserLocation={true} showUserHeading={true}
             style={{
              background:`var(--backdrop)`,
              borderRadius: '20px'
             }}/>


            {centers
              .filter(center =>
                selectedOption.id === -1 || selectedOption.id === center.category.id
              )
              .map((center) => {
                const IconComponent = getIconByCategoryId(center.category.id);
                return (
                  <Marker key={center.id}
                    longitude={center.cordinates.longitude}
                    latitude={center.cordinates.latitude}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      if (active === "home") setSelectedCenter(center);
                    }}>
                    <div className="group flex flex-col items-center space-y-1">
                      <IconComponent className="w-5 h-5" style={{ color: `var(--${center.category.color})` }} />
                      <div className="hidden md:block text-xs">{center.name}</div>
                    </div>
                  </Marker>
                );
              })}

            {route && (
              <Source id="route" type="geojson" data={{ type: "Feature", properties: {}, geometry: route }}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-width": 4,
                    "line-color": "#1E90FF", // automatically adjusts in dark mode
                    "line-opacity": 0.9,
                  }}
                />
              </Source>
            )}

            {/* Floating small popup on map (desktop only) */}
            {selectedCenter && (
              <Marker
                longitude={selectedCenter.cordinates.longitude}
                latitude={selectedCenter.cordinates.latitude}
                anchor="top"
              >
                <MapFloatingCard center={selectedCenter} onClose={() => setSelectedCenter(null)} />
              </Marker>
            )}
          </Map>}

          {active === "centers" && (<CentersPage centers={centers} />)}
          {active === "updates" && (<UpdatesPage />)}
          {active === "settings" && (<SettingsPage />)}
        </div>
      </div>


      {/* Mobile Drawer (kept exactly as before) */}



      {/* Mobile Bottom Nav (no change) */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-30">

        <div className="bg-backdrop backdrop-blur-xl rounded-3xl shadow-2xl border border-separator">
          {selectedCenter && active === "home" && (
            <CenterDetailsDrawer center={selectedCenter} onClose={closeCenterDetails} getDirections={() => { getDirections(selectedCenter) }} isLoadingDirections={isLoadingDirections} />
          )}
          <div className="flex items-center justify-around px-1 py-1 gap-1">

            <button onClick={() => setActive("home")}
              className={`flex flex-col items-center flex-1 rounded-full p-1 ${active === "home" ? "bg-systemGreen text-white" : ""}`}>
              <House className="w-6 h-6" /><span className="text-xs font-medium">Home</span>
            </button>

            <button onClick={() => setActive("centers")}
              className={`flex flex-col items-center flex-1 rounded-full p-1 ${active === "centers" ? "bg-systemGreen text-white" : ""}`}>
              <Building className="w-6 h-6" /><span className="text-xs font-medium">Centers</span>
            </button>

            <button onClick={() => setActive("updates")}
              className={`flex flex-col items-center flex-1 rounded-full p-1 ${active === "updates" ? "bg-systemGreen text-white" : ""}`}>
              <Bell className="w-6 h-6" /><span className="text-xs font-medium">Updates</span>
            </button>

            <button onClick={() => setActive("settings")}
              className={`flex flex-col items-center flex-1 rounded-full p-1 ${active === "settings" ? "bg-systemGreen text-white" : ""}`}>
              <Cog className="w-6 h-6" /><span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
