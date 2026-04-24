"use client";

import Link from "next/link";
import { MapPin, Users, HeartHandshake, ArrowRight, Menu, X, Shield, Zap, Globe, Smartphone } from "lucide-react";
import { FaGooglePlay } from "react-icons/fa6";
import { SiApple } from "react-icons/si";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Our Mission", href: "#mission" },
    { label: "Directory", href: "/app" },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "/images/Screenshot%202026-04-24%20at%2017.16.14.png",
    "/images/Screenshot%202026-04-24%20at%2017.17.30.png"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-systemGreen/30 selection:text-systemGreen transition-colors duration-500 overflow-x-hidden">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-systemGreen/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-systemBlue/5 blur-[100px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[50%] rounded-full bg-systemPurple/5 blur-[150px] animate-pulse-slow [animation-delay:4s]" />
      </div>

      {/* Navigation Bar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled
        ? "py-3 bg-background/70 backdrop-blur-xl border-separator/50 shadow-sm"
        : "py-6 bg-transparent border-transparent"
        }`}>
        <div className="mx-auto max-w-7xl px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-background/70 backdrop-blur-xl border border-separator flex items-center justify-center shadow-[0_0_20px_rgba(3,161,14,0.2)] dark:shadow-[0_0_30px_rgba(3,161,14,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(3,161,14,0.4)] transition-all duration-300 p-2">
              <svg
                viewBox="0 0 490.1 490.1"
                className="w-full h-full fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M134.35,376.1l2.7-19.8c0.7-5,5-8.6,9.8-8.6c-9.1-2.1-36.3,1.3-42.1,2.4c-19.7,4.8-40.1,23.2-51.7,39.6c5.4,25,25.9,43.7,50.5,43.7c4.3,0,8.6-0.8,12.4-1.9c-0.8-3.1,0-6.6,2.3-9.3C128.45,411.1,131.55,394.7,134.35,376.1z" />
                <path d="M42.15,114.3c-0.1,0-0.2,0.1-0.3,0.1C42.05,114.5,42.25,114.5,42.15,114.3z" />
                <path d="M177.05,0c-26.4,0-48.2,21.8-51.3,49.8c12.9,2.1,24.9,53.3,25.7,72.7c0,5.4-4.3,10.1-9.7,10.1h-0.4c-5.4,0-9.7-4.3-10.1-9.7c0.2-26.6-16-60.3-17.2-65.1c-3.3-0.7-6.8-1.4-10.4-1.4c-24.6,0-45.1,18.8-50.5,44.2c5,5.8,17.7,19.1,41.2,27c20,6.8,41.6,8.9,63,7.8c5.4,0,10.1,3.9,10.5,9.3c0.4,5.4-3.9,10.1-9.3,10.5c-19.2,1.7-50.2-2.7-69.6-8.6c-6.2-1.9-28-6.1-48.5-31.8c-23.2,6.9-40.2,29.4-40.2,56.7c0,9.4,2,18.4,5.8,26.5c54.9-6.4,85.4-4.4,96.9-1.3c29.9,8.2,55.2,25.7,64.9,37.3c3.5,4.3,3.1,10.5-1.2,14c-1.9,1.6-8.6,5-14-1.2c-13.5-15.6-44.7-28.4-54.4-30.7c-17.9-4.2-67.6-0.5-92.4,2.1c-3.5,7.9-5.6,16.9-5.6,26.3c0,9.1,1.9,17.6,5.4,25.1c48.6,8.8,69.6-10.4,80.1-17c5.8-3.9,12.1-7.8,18.3-11.3c4.7-2.7,10.9-0.8,13.6,3.9c2.7,4.7,0.8,10.9-3.9,13.6c-5.8,3.1-11.3,6.6-16.7,10.5c-11.3,7.4-37.5,28.7-90.2,21.2c-4.2,8.3-6.7,17.9-6.7,27.8c0,26.9,17.1,49.6,40,55.8c18.3-23.5,45.5-53.3,110.5-46.4c11.7,1.2,21.8,6.2,29.2,12.8c4.3,3.5,4.7,10.1,0.8,14c-3.5,4.3-10.1,4.7-14,0.8c-5-4.3-11.3-6.3-16.5-7.3c4.5,1.5,7.4,6,6.8,10.8l-2.7,19.8c-2.3,17.1-5.8,40.8-21,56.8c-1.9,1.9-4.7,3.1-7.4,3.1c-0.4,0-0.4,0-0.8,0c2.7,28.8,24.9,51.3,51.7,51.3c28.8,0,51.7-25.7,51.7-57.2s0-344.2,0-375.7C229.25,25.7,205.85,0,177.05,0z M104.75,307.6c-16.7,15.6-42.6,25.6-67.7,24.5c-5.4-0.4-9.7-5.1-9.3-10.5s5.1-9.7,10.5-9.3c19.1,1.2,38.9-5.8,52.9-19.1c3.9-3.9,10.5-3.5,14,0.4C109.05,297.5,108.65,303.7,104.75,307.6z M163.05,35c-2.7-4.7-1.2-10.9,3.5-13.6c4.7-2.7,10.9-1.2,13.6,3.5c14.8,24.5,22.9,52.5,22.9,81.3c0,5.4-4.3,10.1-9.7,10.1s-9.7-4.3-10.1-9.7C182.95,80.9,175.95,56.4,163.05,35z M162.75,206.1c-11.3-15.2-28-26.1-46.7-29.6c-5.4-1.2-8.9-6.2-7.8-11.7c1.2-5.4,6.2-8.9,11.7-7.8c23.3,4.7,44.7,18.3,59.1,37.3c14.4,19.1,20.6,43.9,17.9,67.7c-0.8,5.1-5.1,8.8-9.7,8.9c-6,0.2-10.5-5.4-9.7-10.9C179.05,240.7,173.95,221.3,162.75,206.1z M206.25,388.5c-0.8,0-1.6,0.4-2.3,0.4c-4.7,0-8.6-3.1-9.7-7.8c-1.9-8.6-9.7-44.3-16.7-53.3c-12.8-16.4-47.8-28.4-47.8-28.4c-5.1-2.3-7.4-8.2-5.4-13.2c2.3-5.1,8.2-7.4,13.2-5.4c27.6,10.2,44.3,20,56.4,35c10.1,12.6,18.3,51.7,20.6,60.3C215.25,381.9,211.75,387.3,206.25,388.5z" />
                <path d="M114.85,57.9c-0.1,0-0.1,0-0.2,0C114.75,58.2,114.85,58.2,114.85,57.9z" />
                <path d="M355.75,376.1l-2.7-19.8c-0.7-5-5-8.6-9.8-8.6c9.1-2.1,36.3,1.3,42.1,2.4c19.7,4.8,40.1,23.2,51.7,39.6c-5.4,25-25.9,43.7-50.5,43.7c-4.3,0-8.6-0.8-12.4-1.9c0.8-3.1,0-6.6-2.3-9.3C361.65,411.1,358.55,394.7,355.75,376.1z" />
                <path d="M447.95,114.3c0.1,0,0.2,0.1,0.3,0.1C448.05,114.5,447.95,114.5,447.95,114.3z" />
                <path d="M261.65,57.2c0,31.5,0,344.2,0,375.7s22.9,57.2,51.7,57.2c26.8,0,49-22.6,51.7-51.3c-0.4,0-0.4,0-0.8,0c-2.7,0-5.4-1.2-7.4-3.1c-15.2-15.9-18.7-39.7-21-56.8l-2.7-19.8c-0.7-4.8,2.3-9.3,6.8-10.8c-5.1,1-11.5,3-16.5,7.3c-3.9,3.9-10.5,3.5-14-0.8c-3.9-3.9-3.5-10.5,0.8-14c7.4-6.6,17.5-11.6,29.2-12.8c65.1-6.8,92.3,22.9,110.5,46.4c22.9-6.2,40-28.9,40-55.8c0-10-2.4-19.6-6.7-27.8c-52.7,7.5-78.9-13.8-90.2-21.2c-5.4-3.9-10.9-7.4-16.7-10.5c-4.7-2.7-6.6-8.9-3.9-13.6c2.7-4.7,8.9-6.6,13.6-3.9c6.2,3.5,12.4,7.4,18.3,11.3c10.5,6.6,31.6,25.7,80.1,17c3.5-7.6,5.4-16,5.4-25.1c0-9.3-2.2-18.4-5.6-26.3c-24.7-2.6-74.5-6.3-92.4-2.1c-9.7,2.3-40.9,15.1-54.4,30.7c-5.4,6.2-12.1,2.7-14,1.2c-4.3-3.5-4.7-9.7-1.2-14c9.7-11.7,35.1-29.1,64.9-37.3c11.5-3.2,42-5.2,96.9,1.3c3.7-8.1,5.8-17.1,5.8-26.5c0-27.3-17-49.8-40.2-56.7c-20.4,25.7-42.2,29.8-48.5,31.8c-19.4,5.8-50.5,10.3-69.6,8.6c-5.4-0.4-9.7-5.1-9.3-10.5c0.4-5.4,5.1-9.3,10.5-9.3c21.4,1.2,43-1,63-7.8c23.5-7.9,36.2-21.2,41.2-27c-5.4-25.4-25.9-44.2-50.5-44.2c-3.6,0-7.1,0.7-10.4,1.4c-1.2,4.9-17.4,38.5-17.2,65.1c-0.4,5.4-4.7,9.7-10.1,9.7h-0.4c-5.4,0-9.7-4.7-9.7-10.1c0.8-19.4,12.8-70.7,25.7-72.7c-3.1-28.3-24.9-50.1-51.3-50.1C284.25,0,260.95,25.7,261.65,57.2z M384.95,293.6c3.5-3.9,10.1-4.3,14-0.4c14,13.2,33.8,20.2,52.9,19.1c5.4-0.4,10.1,3.9,10.5,9.3s-3.9,10.1-9.3,10.5c-25.1,1.1-50.9-8.9-67.7-24.5C381.45,303.7,381.05,297.5,384.95,293.6z M306.75,106.6c-0.4,5.4-4.7,9.7-10.1,9.7s-9.7-4.7-9.7-10.1c0-28.8,8.2-56.8,22.9-81.3c2.7-4.7,8.9-6.2,13.6-3.5s6.2,8.9,3.5,13.6C314.15,56.4,307.15,80.9,306.75,106.6z M312.65,260.2c0.8,5.4-3.7,11.1-9.7,10.9c-4.7-0.2-8.9-3.9-9.7-8.9c-2.7-23.7,3.5-48.6,17.9-67.7s35.8-32.7,59.1-37.3c5.4-1.2,10.5,2.3,11.7,7.8c1.2,5.4-2.3,10.5-7.8,11.7c-18.7,3.5-35.4,14.4-46.7,29.6C316.15,221.3,311.05,240.7,312.65,260.2z M275.65,376.1c2.3-8.6,10.5-47.7,20.6-60.3c12.1-15,28.8-24.8,56.4-35c5.1-1.9,10.9,0.4,13.2,5.4c1.9,5.1-0.4,10.9-5.4,13.2c0,0-35,12-47.8,28.4c-7,9-14.8,44.7-16.7,53.3c-1.2,4.7-5.1,7.8-9.7,7.8c-0.8,0-1.6-0.4-2.3-0.4C278.45,387.3,274.95,381.9,275.65,376.1z" />
                <path d="M375.25,57.9c0.1,0,0.1,0,0.2,0C375.35,58.2,375.25,58.2,375.25,57.9z" />
              </svg>
            </div>
            <span className="font-black text-2xl tracking-tighter">Mind<span className="text-systemGreen">Access</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-labelSecondary hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-systemGreen transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">

            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-2xl bg-foreground text-background px-6 py-2.5 text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10"
            >
              Launch App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 glass rounded-xl transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] bg-background/95 backdrop-blur-2xl z-40 p-6 flex flex-col gap-6 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-2xl font-bold border-b border-separator/30 pb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="mt-4 w-full py-5 bg-systemGreen text-white text-center text-xl font-bold rounded-2xl shadow-xl shadow-systemGreen/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch Directory
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold uppercase tracking-widest text-systemGreen animate-bounce">
                <span className="w-2 h-2 rounded-full bg-systemGreen animate-ping" />
                Live in Uganda
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tight">
                Access <span className="gradient-text">Care</span> <br />
                Without Boundaries
              </h1>
              <p className="text-xl md:text-2xl text-labelSecondary leading-relaxed max-w-xl">
                The most comprehensive directory for mental health and rehabilitation services in Uganda. Find help, get directions, and connect with professionals instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link
                  href="/app"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-3xl bg-systemGreen px-8 py-5 text-xl font-bold text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-systemGreen/30"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">Find a Center</span>
                  <ArrowRight className="w-6 h-6 relative z-10" />
                </Link>

              </div>

              <div className="flex items-center gap-6 pt-10 border-t border-separator/30">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-systemGreen/50 bg-backgroundLayer1 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 124}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-labelSecondary">
                  <span className="font-bold text-foreground">500+</span> centers listed across the country
                </div>
              </div>
            </div>

            {/* Hero Graphic / Visual */}
            <div className="relative md:block hidden animate-float h-[600px] lg:h-[800px] w-full mt-20 lg:mt-0">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-systemGreen/20 blur-[100px] rounded-full scale-110 z-0 opacity-50" />
              <div className="absolute -inset-10 bg-systemGreen/10 blur-[120px] rounded-full z-0 animate-pulse-slow" />

              {/* Centered Image & Overlay Container */}
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center scale-110 lg:scale-125">
                  {/* Slider Images (Base Layer) */}
                  {heroImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`App view ${index}`}
                      className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out drop-shadow-2xl ${index === currentImageIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                        }`}
                    />
                  ))}

                  {/* Navigation Dots (On top of images) */}
                  <div className="absolute bottom-[30%] right-[10%] z-20">
                    <div className="flex gap-2 p-2 glass rounded-2xl">
                      {heroImages.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-500 ${i === currentImageIndex ? "w-6 md:w-8 bg-systemGreen" : "bg-white/30"
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verified Support Badge (On top of images) */}
                  <div className="absolute bottom-[30%] md:bottom-[20%] lg:bottom-[20%] left-[10%] text-white pointer-events-none z-20 max-w-[180px] md:max-w-[240px]">
                    <div className="glass p-3 md:p-4 rounded-[24px]">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-systemGreen flex items-center justify-center shrink-0">
                          <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[10px] md:text-xs">Verified Support</div>
                          <div className="text-[8px] md:text-[9px] text-white/70 leading-tight">Expert-reviewed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Access Card (Moved into the scaling group to sit on the window) */}
                  <div className="absolute top-[20%] right-[5%] z-30 bg-white/60 glass px-4 py-2 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)] w-48 md:w-64 border-2 border-white dark:border-white/10 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 text-white">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-systemYellow" />
                      <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Fast Access</span>
                    </div>
                    <div className="text-[8px] md:text-[9px] text-white/70 leading-relaxed">Direct contact with emergency helplines.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Multi-Device Showcase Section */}
      <section className="relative py-32 overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-32">
            {/* Right Side: Staggered Device Showcase (Mobile & Tablet) */}
            <div className="flex-1 relative order-2 lg:order-1 h-[500px] md:h-[700px] w-full max-w-[800px] lg:-ml-20 perspective-2000 isolate">
              {/* Intensified Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-systemGreen/40 blur-[120px] z-0 rounded-full animate-pulse-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-systemGreen/30 blur-[60px] z-0 rounded-full" />

              {/* Tablet View */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] transition-all duration-700 hover:scale-105 z-20">
                <img
                  src="/images/ScreenshotTab1.png"
                  alt="MindAccess Tablet Interface"
                  className="w-full h-auto"
                />
              </div>



              {/* Mobile View 2 (Foreground Right - Pushed Further) */}
              <div className="absolute top-[35%] right-[-5%] md:right-[-15%] -translate-y-1/2 w-[160px] md:w-[240px] z-30 animate-float-delayed">
                <img
                  src="/images/ScreenshotMobile0.png"
                  alt="MindAccess Mobile App 2"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Left Side: Content */}
            <div className="flex-1 space-y-10 order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-systemGreen/10 border border-systemGreen/20 text-systemGreen text-sm font-black tracking-widest uppercase">
                <Smartphone className="w-4 h-4" />
                <span>Responsive Excellence</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                Designed for <br />
                <span className="gradient-text">every screen.</span>
              </h2>
              <p className="text-xl text-labelSecondary leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Whether you're on a phone, tablet, or desktop, MindAccess provides a seamless, high-performance experience. Our native Android app brings the power of precision mapping to your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start pt-4">
                {/* Play Store Download */}
                <Link
                  href="#"
                  className="group relative flex items-center gap-4 bg-foreground text-background px-10 py-5 rounded-[2rem] font-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(3,161,14,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-systemGreen/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 flex items-center justify-center bg-systemGreen rounded-xl shadow-lg shadow-systemGreen/40">
                    <FaGooglePlay className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">AVAILABLE NOW ON</div>
                    <div className="text-xl">Google Play</div>
                  </div>
                </Link>

                {/* App Store Badge (Soon) */}
                <div className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-separator/10 border border-separator/20 opacity-40 grayscale pointer-events-none group">
                  <SiApple className="w-10 h-10" />
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">COMING SOON</div>
                    <div className="text-xl">App Store</div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="pt-10 flex flex-wrap justify-center lg:justify-start gap-10">
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-black text-foreground tracking-tighter">100%</div>
                  <div className="text-xs font-black text-systemGreen uppercase tracking-widest">Native App</div>
                </div>
                <div className="w-px h-12 bg-separator/30" />
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-black text-foreground tracking-tighter">60FPS</div>
                  <div className="text-xs font-black text-systemGreen uppercase tracking-widest">Performance</div>
                </div>
                <div className="w-px h-12 bg-separator/30" />
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-black text-foreground tracking-tighter">Oms</div>
                  <div className="text-xs font-black text-systemGreen uppercase tracking-widest">Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-12 bg-foreground/5 backdrop-blur-3xl">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-systemGreen">Capabilities</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Everything you need <br />to find the <span className="gradient-text">right help.</span></h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: MapPin,
                title: "Precision Mapping",
                desc: "High-accuracy geolocation using H3 spatial indexing to find centers within your exact radius.",
                color: "systemGreen"
              },
              {
                icon: Globe,
                title: "Nationwide Coverage",
                desc: "From Kampala to Gulu, we've mapped every major rehabilitation and counseling facility.",
                color: "systemGreen"
              },
              {
                icon: Zap,
                title: "Instant Directions",
                desc: "Integrated Mapbox turn-by-turn navigation directly to the facility gates.",
                color: "systemGreen"
              },
              {
                icon: Users,
                title: "Community Driven",
                desc: "Centers can manage their own data, ensuring operating hours and services are always current.",
                color: "systemGreen"
              },
              {
                icon: Shield,
                title: "Safe & Private",
                desc: "Browse anonymously. Your search history is never stored or tracked. Privacy is our priority.",
                color: "systemGreen"
              },
              {
                icon: HeartHandshake,
                title: "Holistic Support",
                desc: "Filters for various categories including rehab, counseling, and social support services.",
                color: "systemGreen"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[32px] glass hover:bg-backgroundPrimary transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl bg-systemGreen/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(3,161,14,0.1)] group-hover:shadow-[0_0_25px_rgba(3,161,14,0.3)]`}>
                  <feature.icon className="w-7 h-7 text-systemGreen" />
                </div>
                <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                <p className="text-labelSecondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative z-10 py-40 px-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-[48px] bg-gradient-to-br from-systemGreen to-systemBlue p-12 md:p-24 overflow-hidden text-center text-white shadow-2xl shadow-systemGreen/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Making Mental Health <br />Accessible to All.</h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
                Join the thousands of Ugandans finding support every month. No fees, no accounts, just care.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link
                  href="/app"
                  className="px-12 py-6 bg-white text-systemGreen rounded-3xl text-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  Start Exploring
                </Link>
                <Link
                  href="/app/data"
                  className="px-12 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-3xl text-2xl font-black hover:bg-white/20 transition-all"
                >
                  List Facility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 bg-background pt-32 pb-16 px-6 md:px-12 border-t border-separator/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-background/70 backdrop-blur-xl border border-separator flex items-center justify-center shadow-[0_0_20px_rgba(3,161,14,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(3,161,14,0.3)] transition-all duration-300 p-2">
                  <svg
                    viewBox="0 0 490.1 490.1"
                    className="w-full h-full fill-current text-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M134.35,376.1l2.7-19.8c0.7-5,5-8.6,9.8-8.6c-9.1-2.1-36.3,1.3-42.1,2.4c-19.7,4.8-40.1,23.2-51.7,39.6c5.4,25,25.9,43.7,50.5,43.7c4.3,0,8.6-0.8,12.4-1.9c-0.8-3.1,0-6.6,2.3-9.3C128.45,411.1,131.55,394.7,134.35,376.1z" />
                    <path d="M42.15,114.3c-0.1,0-0.2,0.1-0.3,0.1C42.05,114.5,42.25,114.5,42.15,114.3z" />
                    <path d="M177.05,0c-26.4,0-48.2,21.8-51.3,49.8c12.9,2.1,24.9,53.3,25.7,72.7c0,5.4-4.3,10.1-9.7,10.1h-0.4c-5.4,0-9.7-4.3-10.1-9.7c0.2-26.6-16-60.3-17.2-65.1c-3.3-0.7-6.8-1.4-10.4-1.4c-24.6,0-45.1,18.8-50.5,44.2c5,5.8,17.7,19.1,41.2,27c20,6.8,41.6,8.9,63,7.8c5.4,0,10.1,3.9,10.5,9.3c0.4,5.4-3.9,10.1-9.3,10.5c-19.2,1.7-50.2-2.7-69.6-8.6c-6.2-1.9-28-6.1-48.5-31.8c-23.2,6.9-40.2,29.4-40.2,56.7c0,9.4,2,18.4,5.8,26.5c54.9-6.4,85.4-4.4,96.9-1.3c29.9,8.2,55.2,25.7,64.9,37.3c3.5,4.3,3.1,10.5-1.2,14c-1.9,1.6-8.6,5-14-1.2c-13.5-15.6-44.7-28.4-54.4-30.7c-17.9-4.2-67.6-0.5-92.4,2.1c-3.5,7.9-5.6,16.9-5.6,26.3c0,9.1,1.9,17.6,5.4,25.1c48.6,8.8,69.6-10.4,80.1-17c5.8-3.9,12.1-7.8,18.3-11.3c4.7-2.7,10.9-0.8,13.6,3.9c2.7,4.7,0.8,10.9-3.9,13.6c-5.8,3.1-11.3,6.6-16.7,10.5c-11.3,7.4-37.5,28.7-90.2,21.2c-4.2,8.3-6.7,17.9-6.7,27.8c0,26.9,17.1,49.6,40,55.8c18.3-23.5,45.5-53.3,110.5-46.4c11.7,1.2,21.8,6.2,29.2,12.8c4.3,3.5,4.7,10.1,0.8,14c-3.5,4.3-10.1,4.7-14,0.8c-5-4.3-11.3-6.3-16.5-7.3c4.5,1.5,7.4,6,6.8,10.8l-2.7,19.8c-2.3,17.1-5.8,40.8-21,56.8c-1.9,1.9-4.7,3.1-7.4,3.1c-0.4,0-0.4,0-0.8,0c2.7,28.8,24.9,51.3,51.7,51.3c28.8,0,51.7-25.7,51.7-57.2s0-344.2,0-375.7C229.25,25.7,205.85,0,177.05,0z M104.75,307.6c-16.7,15.6-42.6,25.6-67.7,24.5c-5.4-0.4-9.7-5.1-9.3-10.5s5.1-9.7,10.5-9.3c19.1,1.2,38.9-5.8,52.9-19.1c3.9-3.9,10.5-3.5,14,0.4C109.05,297.5,108.65,303.7,104.75,307.6z M163.05,35c-2.7-4.7-1.2-10.9,3.5-13.6c4.7-2.7,10.9-1.2,13.6,3.5c14.8,24.5,22.9,52.5,22.9,81.3c0,5.4-4.3,10.1-9.7,10.1s-9.7-4.3-10.1-9.7C182.95,80.9,175.95,56.4,163.05,35z M162.75,206.1c-11.3-15.2-28-26.1-46.7-29.6c-5.4-1.2-8.9-6.2-7.8-11.7c1.2-5.4,6.2-8.9,11.7-7.8c23.3,4.7,44.7,18.3,59.1,37.3c14.4,19.1,20.6,43.9,17.9,67.7c-0.8,5.1-5.1,8.8-9.7,8.9c-6,0.2-10.5-5.4-9.7-10.9C179.05,240.7,173.95,221.3,162.75,206.1z M206.25,388.5c-0.8,0-1.6,0.4-2.3,0.4c-4.7,0-8.6-3.1-9.7-7.8c-1.9-8.6-9.7-44.3-16.7-53.3c-12.8-16.4-47.8-28.4-47.8-28.4c-5.1-2.3-7.4-8.2-5.4-13.2c2.3-5.1,8.2-7.4,13.2-5.4c27.6,10.2,44.3,20,56.4,35c10.1,12.6,18.3,51.7,20.6,60.3C215.25,381.9,211.75,387.3,206.25,388.5z" />
                    <path d="M114.85,57.9c-0.1,0-0.1,0-0.2,0C114.75,58.2,114.85,58.2,114.85,57.9z" />
                    <path d="M355.75,376.1l-2.7-19.8c-0.7-5-5-8.6-9.8-8.6c9.1-2.1,36.3,1.3,42.1,2.4c19.7,4.8,40.1,23.2,51.7,39.6c-5.4,25-25.9,43.7-50.5,43.7c-4.3,0-8.6-0.8-12.4-1.9c0.8-3.1,0-6.6-2.3-9.3C361.65,411.1,358.55,394.7,355.75,376.1z" />
                    <path d="M447.95,114.3c0.1,0,0.2,0.1,0.3,0.1C448.05,114.5,447.95,114.5,447.95,114.3z" />
                    <path d="M261.65,57.2c0,31.5,0,344.2,0,375.7s22.9,57.2,51.7,57.2c26.8,0,49-22.6,51.7-51.3c-0.4,0-0.4,0-0.8,0c-2.7,0-5.4-1.2-7.4-3.1c-15.2-15.9-18.7-39.7-21-56.8l-2.7-19.8c-0.7-4.8,2.3-9.3,6.8-10.8c-5.1,1-11.5,3-16.5,7.3c-3.9,3.9-10.5,3.5-14-0.8c-3.9-3.9-3.5-10.5,0.8-14c7.4-6.6,17.5-11.6,29.2-12.8c65.1-6.8,92.3,22.9,110.5,46.4c22.9-6.2,40-28.9,40-55.8c0-10-2.4-19.6-6.7-27.8c-52.7,7.5-78.9-13.8-90.2-21.2c-5.4-3.9-10.9-7.4-16.7-10.5c-4.7-2.7-6.6-8.9-3.9-13.6c2.7-4.7,8.9-6.6,13.6-3.9c6.2,3.5,12.4,7.4,18.3,11.3c10.5,6.6,31.6,25.7,80.1,17c3.5-7.6,5.4-16,5.4-25.1c0-9.3-2.2-18.4-5.6-26.3c-24.7-2.6-74.5-6.3-92.4-2.1c-9.7,2.3-40.9,15.1-54.4,30.7c-5.4,6.2-12.1,2.7-14,1.2c-4.3-3.5-4.7-9.7-1.2-14c9.7-11.7,35.1-29.1,64.9-37.3c11.5-3.2,42-5.2,96.9,1.3c3.7-8.1,5.8-17.1,5.8-26.5c0-27.3-17-49.8-40.2-56.7c-20.4,25.7-42.2,29.8-48.5,31.8c-19.4,5.8-50.5,10.3-69.6,8.6c-5.4-0.4-9.7-5.1-9.3-10.5c0.4-5.4,5.1-9.3,10.5-9.3c21.4,1.2,43-1,63-7.8c23.5-7.9,36.2-21.2,41.2-27c-5.4-25.4-25.9-44.2-50.5-44.2c-3.6,0-7.1,0.7-10.4,1.4c-1.2,4.9-17.4,38.5-17.2,65.1c-0.4,5.4-4.7,9.7-10.1,9.7h-0.4c-5.4,0-9.7-4.7-9.7-10.1c0.8-19.4,12.8-70.7,25.7-72.7c-3.1-28.3-24.9-50.1-51.3-50.1C284.25,0,260.95,25.7,261.65,57.2z M384.95,293.6c3.5-3.9,10.1-4.3,14-0.4c14,13.2,33.8,20.2,52.9,19.1c5.4-0.4,10.1,3.9,10.5,9.3s-3.9,10.1-9.3,10.5c-25.1,1.1-50.9-8.9-67.7-24.5C381.45,303.7,381.05,297.5,384.95,293.6z M306.75,106.6c-0.4,5.4-4.7,9.7-10.1,9.7s-9.7-4.7-9.7-10.1c0-28.8,8.2-56.8,22.9-81.3c2.7-4.7,8.9-6.2,13.6-3.5s6.2,8.9,3.5,13.6C314.15,56.4,307.15,80.9,306.75,106.6z M312.65,260.2c0.8,5.4-3.7,11.1-9.7,10.9c-4.7-0.2-8.9-3.9-9.7-8.9c-2.7-23.7,3.5-48.6,17.9-67.7s35.8-32.7,59.1-37.3c5.4-1.2,10.5,2.3,11.7,7.8c1.2,5.4-2.3,10.5-7.8,11.7c-18.7,3.5-35.4,14.4-46.7,29.6C316.15,221.3,311.05,240.7,312.65,260.2z M275.65,376.1c2.3-8.6,10.5-47.7,20.6-60.3c12.1-15,28.8-24.8,56.4-35c5.1-1.9,10.9,0.4,13.2,5.4c1.9,5.1-0.4,10.9-5.4,13.2c0,0-35,12-47.8,28.4c-7,9-14.8,44.7-16.7,53.3c-1.2,4.7-5.1,7.8-9.7,7.8c-0.8,0-1.6-0.4-2.3-0.4C278.45,387.3,274.95,381.9,275.65,376.1z" />
                    <path d="M375.25,57.9c0.1,0,0.1,0,0.2,0C375.35,58.2,375.25,58.2,375.25,57.9z" />
                  </svg>
                </div>
                <span className="font-black text-2xl tracking-tighter">MindAccess</span>
              </Link>
              <p className="text-labelSecondary leading-relaxed">
                Building the digital bridge between those who need help and those who provide it. Uganda's official mental health directory.
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-widest text-xs text-labelTertiary mb-8">Navigation</h5>
              <ul className="space-y-4">
                <li><Link href="/app" className="font-bold hover:text-systemGreen transition">Directory</Link></li>
                <li><Link href="/app/data" className="font-bold hover:text-systemGreen transition">Management</Link></li>
                <li><Link href="#features" className="font-bold hover:text-systemGreen transition">Features</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-widest text-xs text-labelTertiary mb-8">Resource</h5>
              <ul className="space-y-4">
                <li><Link href="/api/help" className="font-bold hover:text-systemGreen transition">Get Help</Link></li>
                <li><Link href="/api/terms" className="font-bold hover:text-systemGreen transition">Privacy Policy</Link></li>
                <li><Link href="/api/faq" className="font-bold hover:text-systemGreen transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-widest text-xs text-labelTertiary mb-8">Stay Connected</h5>
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-systemGreen hover:text-white transition-colors cursor-pointer">
                    <Globe className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-separator/30 text-center flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-labelSecondary font-medium font-mono tracking-widest uppercase">
              &copy; 2026 MINDACCESS &mdash; MADE WITH ❤️ FOR UGANDA
            </p>
            <div className="flex gap-8">
              <span className="text-xs font-black text-systemGreen animate-pulse">SYSTEMS NOMINAL</span>
              <span className="text-xs font-black text-labelTertiary">V2.4.0-STABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
