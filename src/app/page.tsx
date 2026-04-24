"use client";

import Link from "next/link";
import { MapPin, Users, HeartHandshake, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Get Started", href: "#cta" },
    { label: "Explore App", href: "/app" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-separator bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-systemGreen flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-lg">MindAccess</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium hover:text-systemGreen transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA Button */}
            <div className="hidden md:flex">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-2xl bg-systemGreen px-6 py-2 text-sm font-semibold text-white hover:bg-systemGreen/90 transition"
              >
                Launch App
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-backgroundLayer1 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-separator py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-2 text-sm font-medium hover:bg-backgroundLayer1 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/app"
                className="block px-4 py-2 bg-systemGreen text-white text-sm font-semibold rounded-lg hover:bg-systemGreen/90 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Launch App
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              Find Support <span className="text-systemGreen">Centers Near You</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-labelSecondary max-w-2xl">
              Access mental health and rehabilitation services across Uganda. Discover counseling centers, rehabilitation facilities, and support services tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-systemGreen px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-systemGreen/90 transition"
              >
                Explore Centers <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/app/data"
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-separator bg-backgroundPrimary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-backgroundLayer1 transition"
              >
                Add a Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 sm:px-6 py-16 sm:py-20 md:px-12 md:py-32 bg-backgroundLayer1">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 text-center">Why MindAccess?</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl sm:rounded-3xl border border-separator bg-backgroundPrimary p-6 sm:p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-systemGreen/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-systemGreen" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Find Nearby Services</h3>
              <p className="text-sm sm:text-base text-labelSecondary">
                Discover rehabilitation centers, counseling services, and mental health facilities near your location with real-time map integration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl sm:rounded-3xl border border-separator bg-backgroundPrimary p-6 sm:p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-systemGreen/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-systemGreen" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Multiple Service Types</h3>
              <p className="text-sm sm:text-base text-labelSecondary">
                Browse rehabilitation centers, counseling centers, and other mental health facilities all in one comprehensive directory.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl sm:rounded-3xl border border-separator bg-backgroundPrimary p-6 sm:p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-systemGreen/10 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-systemGreen" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Complete Information</h3>
              <p className="text-sm sm:text-base text-labelSecondary">
                Access detailed contact information, operating hours, services offered, and directions to each facility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="px-4 sm:px-6 py-16 sm:py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-4xl rounded-2xl sm:rounded-3xl border border-separator bg-backgroundPrimary p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">Ready to Start?</h2>
          <p className="text-base sm:text-lg text-labelSecondary max-w-2xl mx-auto">
            Whether you're looking for support or want to contribute by adding a new center, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-systemGreen px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-systemGreen/90 transition"
            >
              Browse Centers
            </Link>
            <Link
              href="/app/data"
              className="inline-flex items-center justify-center gap-2 rounded-3xl border border-separator bg-backgroundLayer1 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-backgroundLayer2 transition"
            >
              List Your Center
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-backgroundLayer1 border-t border-separator px-4 sm:px-6 py-12 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">MindAccess</h3>
              <p className="text-sm text-labelSecondary">
                Connecting people with mental health and rehabilitation services.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-base">App</h4>
              <ul className="space-y-2 text-sm text-labelSecondary">
                <li><Link href="/app" className="hover:text-foreground transition">Browse Centers</Link></li>
                <li><Link href="/app/data" className="hover:text-foreground transition">Add Center</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Information</h4>
              <ul className="space-y-2 text-sm text-labelSecondary">
                <li><Link href="/api/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/api/help" className="hover:text-foreground transition">Help</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Legal</h4>
              <ul className="space-y-2 text-sm text-labelSecondary">
                <li><Link href="/api/terms" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="/api/faq" className="hover:text-foreground transition">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-separator text-center text-sm text-labelSecondary">
            <p>&copy; 2026 MindAccess. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
