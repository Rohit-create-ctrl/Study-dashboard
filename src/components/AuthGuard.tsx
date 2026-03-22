"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

    if (!user && !isAuthRoute) {
      setIsRedirecting(true);
      router.replace("/login");
    } else if (user && isAuthRoute) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    } else {
      setIsRedirecting(false);
    }
  }, [user, isLoading, router, pathname]);

  // We no longer block on `isLoading` so the dashboard layout appears INSTANTLY.
  // The page components handle their own skeleton loaders.
  // We ONLY block if we are actively redirecting to prevent a flash of wrong content.
  if (isRedirecting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] z-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Authenticating...</p>
      </div>
    );
  }


  return <>{children}</>;
}
