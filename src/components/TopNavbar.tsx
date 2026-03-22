"use client";

import { Bell, LogOut, ChevronDown, User as UserIcon, Settings, Sun, Moon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dateStr, setDateStr] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setDateStr(today.toLocaleDateString(undefined, options));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-28 flex items-center justify-between px-10 relative z-20">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white transition-colors">
          {greeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || 'Scholar'}</span>
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{dateStr}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md group"
          >
            <Bell className="w-5 h-5 group-hover:shake" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-800" />
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50"
              >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Notifications</h4>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full">2 New</span>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-white/5 cursor-pointer group">
                    <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">Welcome to StudyFlow! 🚀</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Start by adding your first subject to organize your notes.</p>
                  </div>
                  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-white/5 cursor-pointer group">
                    <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">AI Assistant Ready</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ask questions and summarize notes with our new Llama 3 assistant.</p>
                  </div>
                </div>

                <div className="p-4 text-center">
                  <button className="text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest transition-colors">Clear All Notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
                <span className="text-sm font-bold text-white uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Elite Member
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-1">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.email}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                  <UserIcon className="w-4 h-4" /> Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                
                <div className="h-[1px] bg-slate-100 dark:bg-white/5 my-1" />
                
                <button 
                  onClick={() => logout()}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
