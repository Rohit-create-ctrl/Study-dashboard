import { Timer } from "lucide-react";

export default function PomodoroPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] animate-fade-in-up">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Timer className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Focus Timer</h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          Your Pomodoro timer is globally accessible anywhere in the dashboard! Just click the floating widget in the bottom right corner to start your next deep work session.
        </p>
      </div>
    </div>
  );
}
