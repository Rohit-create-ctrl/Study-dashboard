"use client";
import { useEffect, useState } from "react";
import { subscribeToToasts, ToastType } from "@/lib/toast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ToastProvider() {
  const [messages, setMessages] = useState<{id: number, text: string, type: ToastType}[]>([]);

  useEffect(() => {
    return subscribeToToasts((msg, type) => {
      const id = Date.now() + Math.random();
      setMessages((prev) => [...prev, { id, text: msg, type }]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, 3000);
    });
  }, []);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
      {messages.map((m) => {
        const isSuccess = m.type === "success";
        const isError = m.type === "error";
        return (
          <div 
            key={m.id} 
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] animate-fade-in-up text-sm font-semibold border ${
              isSuccess ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
              isError ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
              "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />}
            {isError && <AlertCircle className="w-5 h-5 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />}
            {m.text}
          </div>
        );
      })}
    </div>
  );
}
