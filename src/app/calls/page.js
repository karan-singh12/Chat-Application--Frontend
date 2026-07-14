"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/context/ChatContext";

export default function CallsPage() {
  const { callHistory, clearCallHistory, startCall } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    
    // Check if today
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const filteredHistory = callHistory.filter((log) =>
    log.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCallIcon = (log) => {
    if (log.status === "missed") {
      return {
        icon: "call_missed",
        color: "text-red-400 bg-red-500/10",
        label: "Missed Call"
      };
    }
    if (log.type === "incoming") {
      return {
        icon: "call_received",
        color: "text-emerald-400 bg-emerald-500/10",
        label: "Incoming Call"
      };
    }
    return {
      icon: "call_made",
      color: "text-blue-400 bg-blue-500/10",
      label: "Outgoing Call"
    };
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main calls area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Glowing backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />

        <div className="p-4 flex flex-col gap-6 max-w-[800px] mx-auto w-full">
          {/* Header controls */}
          <section className="pt-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Call History</h1>
                <p className="text-[11px] text-on-surface-variant font-bold mt-0.5">
                  Review and return recent audio & video calls
                </p>
              </div>

              {callHistory.length > 0 && (
                <button
                  onClick={clearCallHistory}
                  className="px-4 py-2 bg-white/5 hover:bg-red-500/15 text-on-surface-variant hover:text-red-400 font-bold rounded-full text-xs transition-all active:scale-97 cursor-pointer border border-white/5"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {/* Contact search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                type="text"
                placeholder="Search calls by contact name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          {/* Call Logs Feed */}
          <div className="space-y-2">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((log) => {
                const callConfig = getCallIcon(log);
                return (
                  <div
                    key={log.id}
                    className="group bg-surface-container/30 border border-white/5 hover:bg-surface-container-high/45 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all duration-300"
                  >
                    {/* User profile / Avatar */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                          src={log.avatar || "/default-avatar.png"}
                          alt={log.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-background-app text-[9px] ${callConfig.color}`}>
                          <span className="material-symbols-outlined text-[11px] font-bold">
                            {callConfig.icon}
                          </span>
                        </div>
                      </div>

                      {/* Caller info */}
                      <div className="min-w-0">
                        <h2 className="text-xs font-bold text-white truncate">{log.name}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-on-surface-variant">
                          <span>{callConfig.label}</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-on-surface-variant/75">{formatTime(log.timestamp)}</span>
                          {log.status === "completed" && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="font-bold">{formatDuration(log.duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Callback Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startCall(log.userId, "audio")}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary text-on-surface-variant flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-primary/20 active:scale-95"
                        title="Voice Call"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                      </button>
                      <button
                        onClick={() => startCall(log.userId, "video")}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary text-on-surface-variant flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-primary/20 active:scale-95"
                        title="Video Call"
                      >
                        <span className="material-symbols-outlined text-[16px]">videocam</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container/10 p-12 text-center rounded-xl border border-white/5 select-none">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high/40 border border-white/5 flex items-center justify-center text-on-surface-variant/20 mx-auto mb-4">
                  <span className="material-symbols-outlined text-[24px]">call_end</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No call history</h3>
                <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  Call logs of voice and video calls will display here. You can callback directly from this page.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
