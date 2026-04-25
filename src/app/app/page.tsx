"use client";

import Map, { NavigationControl, GeolocateControl, Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { Bell, Building, Cog, House, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

import SidebarButton from "@/components/sidebarbutton";
import { Category, Center, rehabilitation, hospital, counselling, tollFree, safeSpace, otherCenter } from "@/utils/center";
import MapFloatingCard from "@/components/MapFloatingCard";
import { getIconByCategoryId } from "@/utils/helpers";
import { useCenters } from "@/context/centers-context";
import CenterDetailsPanel from "@/components/CenterDetailsPanel";
import CenterDetailsDrawer from "@/components/CenterDetailsDrawer";
import CentersPage from "@/components/centerspage";
import UpdatesPage from "@/components/updatespage";
import SettingsPage from "@/components/settingspage";
import { useAuth } from "@/context/auth-context";
import { subscribeToNotifications } from "@/lib/firebase/notificationService";

export default function Home() {
  const { selectedCenter, setSelectedCenter } = useCenters();
  const { user, logOut } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState("home");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Live unread notification badge
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user]);

  const options: Category[] = [
    { label: "All", id: -1, icon: House, color: "systemGreen" },
    rehabilitation,
    hospital,
    counselling,
    tollFree,
    safeSpace,
    otherCenter,
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const [centers, setCenters] = useState<Center[]>([]);
  useEffect((): void => {
    const fetchCenters = (lat: number, lng: number) => {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radiusKm: "70",
      });
      fetch(`/api/centers?${params}`)
        .then((res) => res.json())
        .then((data) => setCenters(Array.isArray(data) ? data : []))
        .catch(console.error);
    };

    // Get user's location and fetch nearby centers
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchCenters(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // Fallback: fetch centers within 70km of Kampala if geolocation fails
        console.warn("Geolocation denied, fetching centers near Kampala (70km radius):", error);
        fetchCenters(0.3476, 32.5825);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
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

          {/* Bell with unread badge */}
          <div className="relative w-full">
            <SidebarButton icon={Bell} label="Updates" isActive={active === "updates"} onClick={() => setActive("updates")} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 lg:right-4 min-w-[18px] h-[18px] px-1 rounded-full bg-systemRed text-white text-[10px] font-black flex items-center justify-center pointer-events-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <SidebarButton icon={Cog} label="Settings" isActive={active === "settings"} onClick={() => setActive("settings")} />

          {/* Spacer pushes account to bottom */}
          <div className="flex-1" />

          {/* Account Panel */}
          {user ? (
            <div className="w-full rounded-2xl bg-backgroundLayer1 border border-separator/50 p-3 space-y-3">
              {/* Avatar + info */}
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "Avatar"}
                    className="w-9 h-9 rounded-full border-2 border-systemGreen/40 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-systemGreen/15 border-2 border-systemGreen/30 flex items-center justify-center text-systemGreen text-xs font-black shrink-0">
                    {user.displayName
                      ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user.email?.[0].toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm font-bold truncate leading-tight">
                    {user.displayName ?? "User"}
                  </p>
                  <p className="text-xs text-labelSecondary truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              {/* Sign out */}
              <button
                id="sidebar-signout-btn"
                onClick={async () => { await logOut(); router.replace("/"); }}
                className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-xl hover:bg-systemRed/10 text-systemRed text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              id="sidebar-signin-btn"
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 rounded-2xl bg-systemGreen/10 hover:bg-systemGreen/20 text-systemGreen text-xs font-black transition-colors border border-systemGreen/20"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Sign In</span>
            </button>
          )}
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
              className={`relative flex flex-col items-center flex-1 rounded-full p-1 ${active === "updates" ? "bg-systemGreen text-white" : ""}`}>
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-1/4 min-w-[16px] h-4 px-0.5 rounded-full bg-systemRed text-white text-[9px] font-black flex items-center justify-center pointer-events-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="text-xs font-medium">Updates</span>
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
