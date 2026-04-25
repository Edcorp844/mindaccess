"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown, LayoutDashboard, Smartphone } from "lucide-react";

export function UserMenu() {
  const { user, profile, logOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-fillTertiary animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-semibold text-labelSecondary hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-2xl bg-systemGreen text-white px-5 py-2 text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-systemGreen/20"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="relative" ref={ref}>
      <button
        id="user-menu-button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? "User avatar"}
            className="w-9 h-9 rounded-full border-2 border-systemGreen/30 group-hover:border-systemGreen transition-colors"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-systemGreen/15 border-2 border-systemGreen/30 group-hover:border-systemGreen flex items-center justify-center text-systemGreen text-xs font-black transition-colors">
            {initials}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-labelSecondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-3xl bg-background/70 backdrop-blur-xl border border-separator/50 shadow-2xl shadow-foreground/10 overflow-hidden z-50 animate-slide-up">
          {/* User info */}
          <div className="px-4 py-4 border-b border-separator/30">
            <div className="flex items-center gap-3 mb-1">
               <p className="text-sm font-black truncate">
                {user.displayName ?? "Welcome!"}
              </p>
              {profile?.role === "admin" && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-systemGreen/10 text-systemGreen px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            <p className="text-xs text-labelSecondary truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="p-2">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-fillSecondary transition-colors text-sm font-bold text-systemGreen"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-fillSecondary transition-colors text-sm font-medium"
            >
              <Smartphone className="w-4 h-4 text-systemBlue" />
              Go to App
            </Link>
          </div>
          <div className="p-2 border-t border-separator/30">
            <button
              onClick={async () => {
                setOpen(false);
                await logOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-systemRed/10 text-systemRed transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
