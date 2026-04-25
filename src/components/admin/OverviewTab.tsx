"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getCentersByCategory, FirestoreCenter } from "@/lib/firebase/centersService";
import { Building2, Users as UsersIcon, PlusCircle, Activity } from "lucide-react";

interface CenterListItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  color: string;
}

export default function OverviewTab() {
  const [centersStats, setCentersStats] = useState<{ label: string; count: number; color: string }[]>([]);
  const [timelineData, setTimelineData] = useState<{ date: string; count: number }[]>([]);
  const [recentCenters, setRecentCenters] = useState<CenterListItem[]>([]);
  const [totals, setTotals] = useState({ centers: 0, users: 0, newThisWeek: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Centers Stats
        const cStats = await getCentersByCategory();
        setCentersStats(cStats);

        // 2. Fetch all centers for timeline and totals
        const centersSnap = await getDocs(query(collection(db, "Centers"), orderBy("createdAt", "desc")));
        const allCenters = centersSnap.docs.map(doc => {
          const data = doc.data() as FirestoreCenter;
          return {
            name: data.name,
            category: data.category,
            id: doc.id,
            createdAt: (data.createdAt as any)?.toDate?.() || new Date()
          } as { name: string; category: string; id: string; createdAt: Date };
        });

        // 3. Totals
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = allCenters.filter(c => c.createdAt > oneWeekAgo).length;

        // 4. Timeline Data (Group by date)
        const timelineMap: Record<string, number> = {};
        allCenters.forEach(c => {
          const date = c.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          timelineMap[date] = (timelineMap[date] || 0) + 1;
        });
        const timeline = Object.entries(timelineMap)
          .map(([date, count]) => ({ date, count }))
          .reverse()
          .slice(-10); // Last 10 days with activity

        // 5. Recent Centers Table
        const recent = allCenters.slice(0, 20).map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          createdAt: c.createdAt.toLocaleDateString(),
          color: cStats.find(s => s.label === c.category)?.color || 'var(--systemGray)'
        }));

        // 6. Users Count
        const usersSnap = await getDocs(collection(db, "users"));

        setTotals({
          centers: allCenters.length,
          users: usersSnap.size,
          newThisWeek
        });
        setTimelineData(timeline);
        setRecentCenters(recent);
      } catch (error) {
        console.error("Error loading overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div>
        <p className="text-labelSecondary animate-pulse font-medium">Crunching dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-slide-in pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
        <p className="text-labelSecondary font-medium">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </header>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Centers"
          value={totals.centers}
          icon={Building2}
          color="systemGreen"
          trend="+5%"
        />
        <SummaryCard
          title="Total Users"
          value={totals.users}
          icon={UsersIcon}
          color="systemBlue"
          trend="+12%"
        />
        <SummaryCard
          title="New This Week"
          value={totals.newThisWeek}
          icon={PlusCircle}
          color="systemPurple"
          trend="New"
        />
        <SummaryCard
          title="System Health"
          value="Optimal"
          icon={Activity}
          color="systemRed"
          trend="100%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Area Chart */}
        <div className="lg:col-span-2 bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={120} className="text-systemGreen" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-systemGreen rounded-full"></span>
              Center Registration Activity
            </h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#32d158" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#32d158" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--labelSecondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--labelSecondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--separator)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#32d158" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black mb-6">Facilities Mix</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={centersStats}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="label"
                >
                  {centersStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--separator)', borderRadius: '15px' }}
                />
                <Legend layout="vertical" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Centers Table */}
      <section className="bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-separator flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Recent Center Additions</h2>
            <p className="text-sm text-labelSecondary mt-1">Live feed of the latest 20 facilities joined.</p>
          </div>
          <div className="bg-systemGreen/10 text-systemGreen px-4 py-2 rounded-full text-xs font-black animate-pulse uppercase tracking-widest">
            Live Update
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-separator/10 text-xs uppercase tracking-tighter font-black text-labelSecondary">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Center Name</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Onboarded At</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentCenters.map((center, idx) => (
                <tr key={center.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-separator/5'} hover:bg-separator/10 transition-colors group`}>
                  <td className="px-8 py-5 font-mono text-[10px] text-labelSecondary">#{center.id.slice(0, 8)}</td>
                  <td className="px-8 py-5 font-bold group-hover:text-systemGreen transition-colors">{center.name}</td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: center.color }}></span>
                      {center.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-labelSecondary">{center.createdAt}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-3 py-1 bg-systemGreen/10 text-systemGreen rounded-full text-[10px] font-black uppercase">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, trend }: { title: string; value: string | number; icon: any; color: string; trend: string }) {
  return (
    <div className="bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className={`absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Icon size={100} style={{ color: `var(--${color})` }} />
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl`} style={{ backgroundColor: `var(--${color})20`, color: `var(--${color})` }}>
          <Icon size={24} />
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'New' ? 'bg-systemPurple/10 text-systemPurple' : 'bg-systemGreen/10 text-systemGreen'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm font-medium text-labelSecondary mb-1">{title}</p>
      <h3 className="text-3xl font-black tracking-tight">{value}</h3>
    </div>
  );
}
