"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Study Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to connect to AI");
      }
      
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "AI Assistant is having trouble. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. How else can I help?" }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[550px] flex flex-col bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Study Assistant</h3>
                  <p className="text-[10px] text-gray-400">Powered by Llama 3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-indigo-600" : "bg-white/10"
                    }`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your study question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/10"
      >
        {isOpen ? <X className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
      </motion.button>
    </div>
  );
}
