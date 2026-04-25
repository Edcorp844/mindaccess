import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CentersProvider } from "@/context/centers-context";
import { AuthProvider } from "@/context/auth-context";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindAccess | Mental Health & Rehab Directory Uganda",
  description: "The most comprehensive directory for mental health and rehabilitation services in Uganda.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <CentersProvider>{children}</CentersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
