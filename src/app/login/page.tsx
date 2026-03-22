"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials. Try again.");
      } else if (data.success && data.user) {
        login(data.user);
        toast.success("Welcome back!");
        // Small delay to ensure cookie is written
        setTimeout(() => {
          router.replace("/dashboard");
        }, 100);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">StudyFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Elevate your learning journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                  placeholder="Email address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            New to StudyFlow? <a href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create Account</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
