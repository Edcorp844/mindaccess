"use client";

import { useState } from "react";
import { House, LayoutDashboard, Users, Building, Bell, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import SidebarButton from "@/components/sidebarbutton";
import OverviewTab from "@/components/admin/OverviewTab";
import CentersTab from "@/components/admin/CentersTab";
import UsersTab from "@/components/admin/UsersTab";
import NotificationsTab from "@/components/admin/NotificationsTab";
import ContentTab from "@/components/admin/ContentTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "centers" | "users" | "notifications" | "content">("overview");
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex flex-col items-center w-20 lg:w-64 border-r border-separator bg-sidebar/95 backdrop-blur-sm p-3 lg:p-6 transition-all duration-300">
        <span className="hidden lg:flex text-2xl font-bold mb-8">Admin Dashboard</span>
        
        <SidebarButton icon={House} label="Back to App" isActive={false} onClick={() => router.push("/")} />
        
        <div className="w-full h-px bg-separator my-4"></div>

        <SidebarButton icon={LayoutDashboard} label="Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <SidebarButton icon={Building} label="Centers" isActive={activeTab === "centers"} onClick={() => setActiveTab("centers")} />
        <SidebarButton icon={Users} label="Users" isActive={activeTab === "users"} onClick={() => setActiveTab("users")} />
        <SidebarButton icon={Bell} label="Notifications" isActive={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
        <SidebarButton icon={FileText} label="Content" isActive={activeTab === "content"} onClick={() => setActiveTab("content")} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "centers" && <CentersTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "content" && <ContentTab />}
        </div>
      </main>
    </div>
  );
}
