"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllRead,
  AppNotification,
} from "@/lib/firebase/notificationService";
import { Bell, BellOff, CheckCheck, Globe, User, Zap } from "lucide-react";

// ── Icon helper ───────────────────────────────────────────────
function TypeBadge({ type }: { type: AppNotification["type"] }) {
  if (type === "general") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-systemBlue/10 text-systemBlue text-[10px] font-black uppercase tracking-widest">
        <Globe className="w-2.5 h-2.5" /> Global
      </span>
    );
  }
  if (type === "account") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-systemGreen/10 text-systemGreen text-[10px] font-black uppercase tracking-widest">
        <User className="w-2.5 h-2.5" /> Account
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-systemPurple/10 text-systemPurple text-[10px] font-black uppercase tracking-widest">
      <Zap className="w-2.5 h-2.5" /> System
    </span>
  );
}

function timeAgo(ts: AppNotification["createdAt"]): string {
  if (!ts) return "";
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

type Filter = "all" | "general" | "account" | "unread";

export default function UpdatesPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleMarkRead = async (notif: AppNotification) => {
    if (!user || notif.read) return;
    await markNotificationRead(user.uid, notif);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    await markAllRead(user.uid);
    setMarkingAll(false);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "general") return n.type === "general";
    if (filter === "account") return n.type === "account" || n.type === "system";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Not logged in ────────────────────────────────────────────
  if (!user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center px-8">
        <div className="w-20 h-20 rounded-3xl bg-systemGreen/10 flex items-center justify-center">
          <Bell className="w-10 h-10 text-systemGreen" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Your Notifications</h2>
          <p className="text-labelSecondary text-sm max-w-xs">
            Sign in to see your personal and system notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-separator/50 shrink-0">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-systemGreen" />
          <h2 className="text-lg font-black tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-systemGreen text-white text-xs font-black">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-labelSecondary hover:text-foreground hover:bg-fillSecondary transition-all disabled:opacity-50"
          >
            {markingAll
              ? <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <CheckCheck className="w-4 h-4" />
            }
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-separator/30 shrink-0 overflow-x-auto">
        {(["all", "unread", "general", "account"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              filter === f
                ? "bg-systemGreen text-white shadow-lg shadow-systemGreen/20"
                : "bg-fillTertiary text-labelSecondary hover:bg-fillSecondary"
            }`}
          >
            {f === "all" && `All (${notifications.length})`}
            {f === "unread" && `Unread (${unreadCount})`}
            {f === "general" && "Global"}
            {f === "account" && "Account"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 rounded-full border-2 border-systemGreen border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8 py-20">
            <div className="w-16 h-16 rounded-2xl bg-fillTertiary flex items-center justify-center">
              <BellOff className="w-8 h-8 text-labelTertiary" />
            </div>
            <p className="text-labelSecondary text-sm font-medium">
              {filter === "unread" ? "You're all caught up!" : "No notifications here."}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-separator/30">
            {filtered.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleMarkRead(notif)}
                className={`w-full text-left px-6 py-4 flex items-start gap-4 transition-all hover:bg-fillTertiary/50 group ${
                  notif.read ? "opacity-60" : ""
                }`}
              >
                {/* Emoji icon */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all ${
                  notif.type === "general"
                    ? "bg-systemBlue/10"
                    : notif.type === "account"
                    ? "bg-systemGreen/10"
                    : "bg-systemPurple/10"
                }`}>
                  {notif.icon || "🔔"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold leading-tight ${notif.read ? "" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-systemGreen shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-labelSecondary leading-relaxed mb-2">
                    {notif.body}
                  </p>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={notif.type} />
                    <span className="text-[10px] text-labelTertiary font-medium">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}