import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import AuthGuard from "@/components/AuthGuard";
import PomodoroWidget from "@/components/PomodoroWidget";
import ToastProvider from "@/components/ToastProvider";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import AIChatAssistant from "@/components/AIChatAssistant";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500 w-full min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Dynamic Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <TopNavbar />
        <main className="flex-1 overflow-hidden p-6 md:p-8 relative z-10">
          <div className="h-full w-full rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden transition-all duration-500">
            <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
              {children}
            </div>
          </div>
        </main>
      </div>
      <PomodoroWidget />
      <ToastProvider />
      <FloatingActionMenu />
      <AIChatAssistant />
    </div>
  );
}

