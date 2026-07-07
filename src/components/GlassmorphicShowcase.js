"use client";

import React, { useState, useEffect, useRef } from "react";

export default function GlassmorphicShowcase() {
  // Scaling states for responsiveness
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width < 896) {
          setScale(width / 896);
        } else {
          setScale(1);
        }
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Reaction states
  const [reactions, setReactions] = useState([
    { id: "smiley", emoji: "😀", count: 3, clicked: false, borderClass: "border-yellow-500/30", bgClass: "bg-yellow-500/10", textClass: "text-yellow-400" },
    { id: "heart", emoji: "❤️", count: 2, clicked: false, borderClass: "border-rose-500/30", bgClass: "bg-rose-500/10", textClass: "text-rose-400" },
    { id: "wave", emoji: "👋", count: 1, clicked: false, borderClass: "border-amber-500/30", bgClass: "bg-amber-500/10", textClass: "text-amber-400" },
  ]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // User replies state
  const [userReplies, setUserReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null); // 'profile' | 'video' | 'database' | 'pulse'
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReactionClick = (id) => {
    setReactions(
      reactions.map((r) => {
        if (r.id === id) {
          const newCount = r.clicked ? r.count - 1 : r.count + 1;
          return { ...r, count: Math.max(0, newCount), clicked: !r.clicked };
        }
        return r;
      })
    );
  };

  const handleAddEmoji = (emoji) => {
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) {
      setReactions(
        reactions.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        )
      );
    } else {
      const newId = `emoji-${Date.now()}`;
      setReactions([
        ...reactions,
        {
          id: newId,
          emoji,
          count: 1,
          clicked: true,
          borderClass: "border-cyan-500/30",
          bgClass: "bg-cyan-500/10",
          textClass: "text-cyan-400",
        },
      ]);
    }
    setShowEmojiPicker(false);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      text: replyText.trim(),
      time: "Just now",
    };

    setUserReplies([...userReplies, newReply]);
    setReplyText("");

    // Temporary toast notification
    const notification = document.createElement("div");
    notification.className = "fixed bottom-5 right-5 z-50 bg-cyan-950/90 border border-cyan-500/30 text-cyan-200 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 backdrop-blur-md animate-fade-in";
    notification.innerHTML = `<span class="material-symbols-outlined text-cyan-400">check_circle</span> Reply sent!`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-500");
      setTimeout(() => notification.remove(), 500);
    }, 2500);
  };

  const handleDeleteAll = () => {
    setUserReplies([]);
    setReactions([
      { id: "smiley", emoji: "😀", count: 3, clicked: false, borderClass: "border-yellow-500/30", bgClass: "bg-yellow-500/10", textClass: "text-yellow-400" },
      { id: "heart", emoji: "❤️", count: 2, clicked: false, borderClass: "border-rose-500/30", bgClass: "bg-rose-500/10", textClass: "text-rose-400" },
      { id: "wave", emoji: "👋", count: 1, clicked: false, borderClass: "border-amber-500/30", bgClass: "bg-amber-500/10", textClass: "text-amber-400" },
    ]);
  };

  return (
    <div 
      ref={wrapperRef} 
      className="w-full flex flex-col items-center select-none py-4 relative" 
      style={{ height: `${620 * scale + 60}px` }}
    >
      {/* Decorative Outer ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Interactive Sandbox Canvas */}
      <div 
        className="relative w-[896px] h-[620px] bg-[#030712]/60 rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm group/canvas"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          position: "absolute",
          top: "16px",
        }}
      >
        
        {/* Vector Grid Backdrop Layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Faint blueprint phone outline SVG */}
        <div className="absolute left-1/2 top-1/2 -translate-x-[55%] -translate-y-1/2 w-[340px] h-[580px] pointer-events-none opacity-[0.06] transition-opacity duration-700 group-hover/canvas:opacity-[0.1]">
          <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full text-cyan-400">
            {/* Phone Outer Rounded Boundary */}
            <rect x="5" y="5" width="90" height="190" rx="16" />
            {/* Phone Screen Boundary */}
            <rect x="8" y="8" width="84" height="184" rx="13" />
            {/* Camera island notch */}
            <rect x="35" y="10" width="30" height="4" rx="2" fill="currentColor" stroke="none" />
            {/* Side Volume Buttons */}
            <rect x="3" y="40" width="2" height="12" rx="0.5" />
            <rect x="3" y="58" width="2" height="12" rx="0.5" />
            {/* Power Button */}
            <rect x="95" y="50" width="2" height="16" rx="0.5" />
            
            {/* Wireframe inner layout */}
            <line x1="12" y1="22" x2="22" y2="22" strokeWidth="1" />
            <line x1="12" y1="26" x2="18" y2="26" strokeWidth="1" />
            
            <circle cx="20" cy="45" r="5" />
            <circle cx="36" cy="45" r="5" />
            <circle cx="52" cy="45" r="5" />
            <circle cx="68" cy="45" r="5" />
            
            <line x1="12" y1="65" x2="88" y2="65" />
            <line x1="12" y1="72" x2="70" y2="72" strokeWidth="0.5" />
            <line x1="12" y1="76" x2="50" y2="76" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Ambient Cyan Glow spots behind components */}
        <div className="absolute top-[20%] left-[20%] w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute top-[40%] right-[10%] w-60 h-60 bg-cyan-600/10 blur-[90px] rounded-full pointer-events-none animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[20%] left-[30%] w-56 h-56 bg-cyan-400/10 blur-[70px] rounded-full pointer-events-none animate-pulse duration-[6000ms]" />

        {/* ==================== FLOATING COMPONENTS ==================== */}

        {/* 1. Profile Widget */}
        <div 
          className="absolute top-[24%] left-[10%] z-20 group/widget transition-all duration-300 hover:-translate-y-1"
          onMouseEnter={() => setActiveTooltip("profile")}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-[18px] bg-slate-900/65 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:shadow-cyan-950/20 hover:shadow-xl">
              <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" className="w-9 h-9 text-cyan-400/80 transition-all group-hover/widget:text-cyan-300 group-hover/widget:scale-105">
                <circle cx="25" cy="18" r="8" />
                <path d="M12 38c0-5 6-8 13-8s13 3 13 8" strokeLinecap="round" />
                <circle cx="36" cy="34" r="3.5" fill="#22d3ee" stroke="#111827" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px] opacity-60 group-hover/widget:opacity-100" />
            
            <div className={`absolute top-20 left-0 w-48 bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all duration-300 z-50 ${activeTooltip === "profile" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  U1
                </div>
                <div>
                  <h5 className="text-white text-xs font-semibold">User Details</h5>
                  <p className="text-[10px] text-cyan-400 font-medium">Active status: On</p>
                </div>
              </div>
              <div className="w-full bg-white/5 h-[1px] my-1.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Manages profile configurations, preferences, and custom avatar properties.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Video Widget */}
        <div 
          className="absolute top-[10%] left-[45%] z-20 group/widget transition-all duration-300 hover:-translate-y-1"
          onMouseEnter={() => setActiveTooltip("video")}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={() => setIsPlayingVideo(true)}
        >
          <div className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-[18px] bg-slate-900/65 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:shadow-cyan-950/20 hover:shadow-xl">
              <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" className="w-9 h-9 text-cyan-400/80 transition-all group-hover/widget:text-cyan-300 group-hover/widget:scale-105">
                <circle cx="25" cy="25" r="13" />
                <polygon points="22,19 31,25 22,31" fill="currentColor" stroke="none" />
              </svg>
            </div>
            
            <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px] opacity-60 group-hover/widget:opacity-100" />
            
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-48 bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all duration-300 z-50 ${activeTooltip === "video" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
              <h5 className="text-white text-xs font-semibold mb-1">Interactive Video</h5>
              <p className="text-[10px] text-slate-400 leading-normal mb-2">
                Click to open a simulated video player showcase inside a glass panel container.
              </p>
              <span className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">touch_app</span> Click to Open
              </span>
            </div>
          </div>
        </div>

        {/* 3. Options Toolbar */}
        <div className="absolute top-[18%] right-[16%] z-30 animate-fade-in [animation-delay:0.3s]">
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-[20px] bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
            <span 
              onClick={() => handleAddEmoji("🔥")}
              className="px-2 py-0.5 border border-emerald-500/50 hover:bg-emerald-500/10 hover:border-emerald-400 text-emerald-400 font-bold text-[10px] tracking-wider rounded cursor-pointer transition-all active:scale-90"
            >
              GIF
            </span>
            
            <span 
              onClick={() => handleAddEmoji("👋")}
              className="text-slate-400 hover:text-white transition-colors font-semibold text-sm cursor-pointer hover:scale-110 active:scale-90"
              title="Add wave"
            >
              @
            </span>
            
            <svg 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
              className="w-4 h-4 text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-115 active:scale-90"
              onClick={() => handleAddEmoji("📌")}
              title="Pin emoji"
            >
              <path d="M12 2v8M9 6h6M12 10l-3 4h6zM12 14v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <svg 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
              className="w-4 h-4 text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-115 active:scale-90"
              onClick={() => handleAddEmoji("📝")}
              title="Add note emoji"
            >
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <div className="w-[1px] h-4 bg-white/10" />

            <svg 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
              className="w-4 h-4 text-slate-400 hover:text-rose-400 transition-all cursor-pointer hover:scale-115 active:scale-90"
              onClick={handleDeleteAll}
              title="Reset replies & reactions"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* 4. Lauren's Main Chat Bubble */}
        <div className="absolute top-[28%] left-[20%] w-[420px] max-w-[90%] z-20 transition-all duration-300">
          <div className="relative p-5 rounded-[24px] bg-slate-900/70 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-[1px] left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    LL
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121625] rounded-full animate-pulse" />
                </div>
                
                <div>
                  <h4 className="text-white text-sm font-semibold tracking-wide">Lauren Lambert</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Core Member</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-medium">1 min. ago</span>
            </div>

            <p className="text-[13px] text-slate-300 leading-relaxed mb-4 font-normal">
              Hey everyone! How is it going?
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {reactions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleReactionClick(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
                    r.clicked 
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-950/20" 
                      : `${r.borderClass} ${r.bgClass} ${r.textClass} hover:bg-white/5`
                  }`}
                >
                  <span className="text-xs">{r.emoji}</span>
                  <span className="text-[10px] font-bold">{r.count}</span>
                </button>
              ))}

              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                  title="React to message"
                >
                  <span className="material-symbols-outlined text-[14px]">add_reaction</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-8 left-0 z-50 flex items-center gap-1.5 bg-slate-950/95 border border-white/15 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md animate-fade-in">
                    {["🔥", "👍", "💡", "😂", "🚀", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddEmoji(emoji)}
                        className="text-sm hover:scale-130 transition-transform active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Database Stack Widget */}
        <div 
          className="absolute bottom-[10%] left-[25%] z-20 group/widget transition-all duration-300 hover:-translate-y-1"
          onMouseEnter={() => setActiveTooltip("database")}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-[18px] bg-slate-900/65 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:shadow-cyan-950/20 hover:shadow-xl">
              <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" className="w-9 h-9 text-cyan-400/80 transition-all group-hover/widget:text-cyan-300 group-hover/widget:scale-105">
                <ellipse cx="18" cy="15" rx="8" ry="3.5" />
                <path d="M10 15v5c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5v-5" />
                <path d="M10 20v5c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5v-5" />
                <rect x="25" y="24" width="16" height="12" rx="2" fill="#13131b" stroke="currentColor" strokeWidth="1.5" />
                <path d="M25 26.5l8 5 8-5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px] opacity-60 group-hover/widget:opacity-100" />
            
            <div className={`absolute bottom-20 left-0 w-48 bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all duration-300 z-50 ${activeTooltip === "database" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
              <h5 className="text-white text-xs font-semibold mb-1">Queue & Database</h5>
              <div className="w-full bg-white/5 h-[1px] my-1" />
              <div className="space-y-1.5 mt-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Database DB:</span>
                  <span className="text-cyan-400 font-bold">12 ms</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Mail Queue:</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Plus circular badge */}
        <div className="absolute bottom-[13%] left-[38%] z-20 transition-all duration-300 hover:scale-105">
          <button 
            onClick={() => handleAddEmoji("👍")}
            className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-950/20 transition-all active:scale-90"
            title="Like message"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {/* 7. Heartbeat / Vitals Widget */}
        <div 
          className="absolute top-[45%] right-[8%] z-20 group/widget transition-all duration-300 hover:-translate-y-1"
          onMouseEnter={() => setActiveTooltip("pulse")}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-[18px] bg-slate-900/65 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:shadow-cyan-950/20 hover:shadow-xl">
              <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" className="w-9 h-9 text-cyan-400/80 transition-all group-hover/widget:text-cyan-300 group-hover/widget:scale-105">
                <path d="M8 25h9l3-8 4 17 3-11 2 2h13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="36" cy="14" r="5" fill="#22d3ee" stroke="#111827" strokeWidth="1.5" />
                <path d="M33.5 14l1.5 1.5 2-2.5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px] opacity-60 group-hover/widget:opacity-100" />
            
            <div className={`absolute bottom-20 right-0 w-48 bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all duration-300 z-50 ${activeTooltip === "pulse" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
              <h5 className="text-white text-xs font-semibold mb-1">Network Latency</h5>
              <div className="w-full bg-white/5 h-[1px] my-1" />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-emerald-400">All Nodes Secure (2ms)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic User Replies Stack */}
        {userReplies.length > 0 && (
          <div className="absolute bottom-[23%] right-[10%] w-[320px] max-h-[160px] overflow-y-auto custom-scrollbar flex flex-col gap-2.5 z-20 pb-2">
            {userReplies.map((reply) => (
              <div 
                key={reply.id} 
                className="self-end p-3.5 rounded-[18px] rounded-br-none bg-gradient-to-br from-cyan-600/40 to-blue-600/35 border border-cyan-400/30 text-white shadow-lg backdrop-blur-xl animate-fade-in w-full text-right"
              >
                <div className="flex items-center justify-between gap-2 mb-1 flex-row-reverse">
                  <span className="text-xs font-semibold text-cyan-200">You</span>
                  <span className="text-[9px] text-slate-400">{reply.time}</span>
                </div>
                <p className="text-xs text-slate-200 leading-normal">{reply.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 8. Reply Input Bar */}
        <div className="absolute bottom-[8%] right-[10%] w-[340px] z-30">
          <form 
            onSubmit={handleSendReply}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl transition-all focus-within:border-cyan-400/40"
          >
            <button
              type="button"
              onClick={() => handleAddEmoji("😀")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <input 
              type="text" 
              placeholder="Reply.." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 outline-none"
            />

            <button
              type="submit"
              className="text-slate-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>

        {/* ==================== INTERACTIVE MODALS ==================== */}

        {/* Video Player Modal */}
        {isPlayingVideo && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center px-4 py-3 bg-slate-950/50 border-b border-white/5">
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  Nexus Live Demo Stream
                </h4>
                <button 
                  onClick={() => setIsPlayingVideo(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="relative aspect-video bg-black flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle_at_center, #22d3ee 0%, transparent 65%)`
                  }}
                />
                
                <div className="flex items-end gap-1 h-16 mb-4">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-cyan-400/80 rounded-full animate-bounce"
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDuration: `${0.6 + Math.random() * 0.8}s` 
                      }} 
                    />
                  ))}
                </div>

                <p className="text-cyan-200 text-xs font-semibold tracking-wider uppercase mb-1">
                  Transmitting data packets...
                </p>
                <p className="text-slate-400 text-[10px]">
                  Simulated network throughput test: 8.4 Gbps
                </p>
              </div>

              <div className="px-4 py-3 bg-slate-950/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">0:24 / 2:00</span>
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400 cursor-pointer">volume_up</span>
                  <span className="material-symbols-outlined text-[14px] text-cyan-400 cursor-pointer">fullscreen</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Instruction Tip */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span><strong>Interactive Sandbox</strong>: Hover for details, click reaction emojis, or type a reply!</span>
      </div>
    </div>
  );
}
