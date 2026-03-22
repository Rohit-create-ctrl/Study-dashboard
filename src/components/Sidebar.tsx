"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { 
  Moon, Sun, LayoutDashboard, BookOpen, CheckSquare, 
  FileText, Timer, Calendar, GraduationCap 
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Results", href: "/dashboard/results", icon: GraduationCap },
  { name: "Notes", href: "/dashboard/notes", icon: FileText },
  { name: "Pomodoro", href: "/dashboard/pomodoro", icon: Timer },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col py-10 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-white/20 dark:border-white/10 transition-all duration-500 relative z-30 shadow-2xl overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-14 px-2">
        <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl p-2.5 shadow-lg shadow-indigo-500/30">
          <BookOpen className="text-white w-7 h-7" />
        </div>
        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
          StudySpace
        </span>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group block"
            >
              <div
                className={`flex items-center px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 relative z-10 ${
                  isActive 
                    ? "text-white" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`mr-4 flex-shrink-0 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                }`} />
                {item.name}
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl -z-10 shadow-lg shadow-indigo-500/40"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600 group-hover:rotate-12 transition-transform" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
            )}
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </aside>
  );
}
