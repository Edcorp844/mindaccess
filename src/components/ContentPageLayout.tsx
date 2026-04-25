"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ContentPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ContentPageLayout({ title, subtitle, children }: ContentPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-systemGreen selection:text-white">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-systemGreen/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-systemBlue/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-labelSecondary hover:text-systemGreen transition-colors mb-12 group"
        >
          <div className="p-2 rounded-full bg-separator/20 group-hover:bg-systemGreen/10 transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold tracking-tight">Back to Home</span>
        </Link>

        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 animate-slide-in">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-labelSecondary font-medium animate-slide-in" style={{ animationDelay: '0.1s' }}>
              {subtitle}
            </p>
          )}
        </header>

        <div className="bg-backgroundLayer1/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="prose prose-invert max-w-none 
            prose-headings:font-black prose-headings:tracking-tight
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-labelSecondary prose-p:leading-relaxed prose-p:text-lg
            prose-strong:text-foreground prose-strong:font-black
            prose-a:text-systemGreen prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-li:marker:text-systemGreen
            ">
            {children}
          </div>
        </div>

        <footer className="mt-20 text-center text-labelSecondary text-sm font-medium border-t border-separator/30 pt-10">
          <p>&copy; {new Date().getFullYear()} MindAccess. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
