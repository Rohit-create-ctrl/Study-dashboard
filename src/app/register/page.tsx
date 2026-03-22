"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, ArrowRight, User, Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Account created! Please login.");
        router.push("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
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
            <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-600/30 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight text-center">Join StudyFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Start your premium learning experience</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-violet-500/10 transition-all"
                  placeholder="Full Name"
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-violet-500/10 transition-all"
                  placeholder="Email address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-violet-500/10 transition-all"
                  placeholder="Create Password"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Register Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Already have an account? <a href="/login" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">Sign In Instead</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
