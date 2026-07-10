"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States for toggles
  const [readReceipts, setReadReceipts] = useState(true);
  const [activeStatus, setActiveStatus] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [themeMode, setThemeMode] = useState("dark"); // "light" or "dark"
  const [language, setLanguage] = useState("English (US)");

  // Active sessions state
  const [sessions, setSessions] = useState([
    {
      id: "macbook",
      device: 'MacBook Pro 14"',
      location: "San Francisco, USA",
      browser: "Chrome",
      active: "Active now",
      current: true,
      icon: "desktop_windows",
    },
    {
      id: "iphone",
      device: "iPhone 15 Pro",
      location: "San Francisco, USA",
      browser: "NexusChat App",
      active: "4 hours ago",
      current: false,
      icon: "smartphone",
    }
  ]);

  const handleTerminateAll = () => {
    setSessions(sessions.filter((s) => s.current));
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Canvas */}
      <main className="flex-grow md:ml-sidebar-width min-h-screen relative overflow-hidden flex flex-col pb-24 md:pb-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />

        {/* One UI Spacious Header */}
        <header className="pt-6 px-4 pb-2 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-full hover:bg-white/5 text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Settings
            </h1>
          </div>
          <p className="text-[10px] text-on-surface-variant font-bold ml-1">
            Configure NexusChat interface and security preferences
          </p>
        </header>

        {/* Settings Scrollable Content */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-[760px] mx-auto space-y-6 pb-12">
            
            {/* Account Settings Section */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase ml-2">
                Account
              </h3>
              <div className="bg-surface-container/30 border border-white/5 rounded-xl p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 p-0.5 flex-shrink-0">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      alt="Profile Avatar"
                      src={
                        user?.avatar ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                      }
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {user?.username || "Alex Rivera"}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {user?.email || "alex.rivera@nexuschat.io"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="px-4 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white rounded-full text-[10px] font-bold transition-all text-center self-start sm:self-auto cursor-pointer"
                >
                  Edit Profile
                </Link>
              </div>
            </section>

            {/* Privacy & Security Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Privacy */}
              <div className="space-y-2">
                <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase ml-2">
                  Privacy
                </h3>
                <div className="bg-surface-container/30 border border-white/5 rounded-xl p-3.5 space-y-4 shadow-md">
                  
                  {/* Read Receipts */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">Read Receipts</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">Show read statuses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        checked={readReceipts}
                        onChange={(e) => setReadReceipts(e.target.checked)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-8.5 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">Active Status</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">Show online status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        checked={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.checked)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-8.5 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-2">
                <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase ml-2">
                  Security
                </h3>
                <div className="bg-surface-container/30 border border-white/5 rounded-xl p-3.5 space-y-4 shadow-md">
                  
                  {/* Two Factor Auth */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">Two-Factor Auth</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">Use OTP security codes</p>
                    </div>
                    <button
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`px-3 py-1 rounded-full font-bold text-[9px] transition-colors border cursor-pointer ${
                        twoFactor
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-white/5 border-white/10 text-on-surface hover:bg-white/10"
                      }`}
                    >
                      {twoFactor ? "Enabled" : "Enable"}
                    </button>
                  </div>

                  {/* Password Change */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Password Change</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">Updated 45d ago</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer transition-colors text-[18px]">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance & Language Section */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase ml-2">
                Appearance & Customization
              </h3>
              <div className="bg-surface-container/30 border border-white/5 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-md">
                
                {/* Theme mode */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">Theme Mode</p>
                  <div className="flex gap-1.5 p-1 bg-surface-container-low border border-white/5 rounded-full">
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-all text-[10px] font-bold cursor-pointer ${
                        themeMode === "light"
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">light_mode</span>
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-all text-[10px] font-bold cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">dark_mode</span>
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Language Select */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">Language</p>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/5 rounded-full px-4 py-2 text-on-surface font-semibold appearance-none focus:outline-none focus:border-primary/50 transition-all text-[11px] cursor-pointer"
                    >
                      <option className="bg-surface">English (US)</option>
                      <option className="bg-surface">Spanish (ES)</option>
                      <option className="bg-surface">German (DE)</option>
                      <option className="bg-surface">French (FR)</option>
                      <option className="bg-surface">Japanese (JP)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Sessions Section */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase ml-2">
                Active Sessions
              </h3>
              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div key={sess.id} className="bg-surface-container/30 border border-white/5 rounded-xl p-3 flex items-center justify-between group shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[16px]">{sess.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="truncate">{sess.device}</span>
                          {sess.current && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] rounded-full uppercase tracking-wider font-extrabold">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-on-surface-variant mt-0.5 truncate">
                          {sess.location} • {sess.browser} • {sess.active}
                        </p>
                      </div>
                    </div>
                    {!sess.current && (
                      <button
                        onClick={() => handleTerminateSession(sess.id)}
                        className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
                        title="Logout session"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                      </button>
                    )}
                  </div>
                ))}
                {sessions.length > 1 && (
                  <button
                    onClick={handleTerminateAll}
                    className="w-full py-2.5 text-center text-red-400 hover:bg-red-500/10 border border-dashed border-red-500/20 rounded-xl transition-colors mt-1.5 text-[10px] font-bold cursor-pointer"
                  >
                    Terminate all other sessions
                  </button>
                )}
              </div>
            </section>

            {/* Support / Legal */}
            <footer className="pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a className="bg-surface-container/15 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:scale-[1.005] active:scale-[0.995] transition-all" href="#">
                <div className="w-8.5 h-8.5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">help</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">Help Center</p>
                  <p className="text-[9px] text-on-surface-variant mt-0.5">FAQs and Tutorials</p>
                </div>
              </a>
              <a className="bg-surface-container/15 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:scale-[1.005] active:scale-[0.995] transition-all" href="#">
                <div className="w-8.5 h-8.5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">Terms &amp; Policy</p>
                  <p className="text-[9px] text-on-surface-variant mt-0.5">Legal information</p>
                </div>
              </a>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
