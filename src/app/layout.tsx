import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudySpace - Your Personal Study Dashboard",
  description: "A beautiful, futuristic dashboard for your study needs.",
};

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex h-screen overflow-hidden transition-colors duration-300`}>
        <div className="relative z-10 flex h-full w-full">
          <AuthProvider>
            <ThemeProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
              <Toaster position="top-right" toastOptions={{
                className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-white/10 shadow-xl rounded-xl',
              }} />
            </ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
