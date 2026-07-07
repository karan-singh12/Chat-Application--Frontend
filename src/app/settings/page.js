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
      <main className="flex-grow md:ml-sidebar-width min-h-screen relative overflow-hidden flex flex-col">
        {/* Page specific background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_45%)] pointer-events-none -z-10" />
        {/* Top AppBar */}
        <header className="sticky top-0 w-full bg-surface/30 backdrop-blur-md border-b border-white/10 z-40 flex justify-between items-center px-gutter h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md font-extrabold bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
              Settings
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors hidden sm:block">
                call
              </span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors hidden sm:block">
                videocam
              </span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                more_vert
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Avatar"
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                }
              />
            </div>
          </div>
        </header>

        {/* Settings Scrollable Content */}
        <div className="flex-grow p-gutter overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-[900px] mx-auto space-y-8 pb-12">
            
            {/* Account Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">person</span>
                <h3 className="font-headline-md text-[20px] font-bold text-white">Account</h3>
              </div>
              <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden glass-panel flex items-center justify-center border border-white/10">
                      <img
                        className="w-full h-full object-cover"
                        alt="Profile Avatar"
                        src={
                          user?.avatar ||
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                        }
                      />
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface text-base font-semibold">
                        {user?.username || "Alex Rivera"}
                      </p>
                      <p className="font-label-sm text-on-surface-variant text-xs">
                        {user?.email || "alex.rivera@nexuschat.io"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg font-label-md hover:bg-primary/20 transition-all text-xs font-bold text-center self-start sm:self-auto"
                  >
                    Edit Profile
                  </Link>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold text-sm">Display Name</p>
                    <p className="font-label-sm text-on-surface-variant text-xs">
                      The name others see in chats
                    </p>
                  </div>
                  <span className="text-on-surface-variant font-label-md text-sm">{user?.username || "Alex R."}</span>
                </div>
              </div>
            </section>

            {/* Privacy & Security Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Privacy */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">shield</span>
                  <h3 className="font-headline-md text-[20px] font-bold text-white">Privacy</h3>
                </div>
                <div className="glass-card rounded-xl p-4 space-y-4">
                  
                  {/* Read Receipts */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-label-md text-on-surface font-semibold text-sm">Read Receipts</p>
                      <p className="font-label-sm text-on-surface-variant text-xs">
                        Allow others to see when you've read messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        checked={readReceipts}
                        onChange={(e) => setReadReceipts(e.target.checked)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-label-md text-on-surface font-semibold text-sm">Active Status</p>
                      <p className="font-label-sm text-on-surface-variant text-xs">Show when you are online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        checked={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.checked)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">lock</span>
                  <h3 className="font-headline-md text-[20px] font-bold text-white">Security</h3>
                </div>
                <div className="glass-card rounded-xl p-4 space-y-4">
                  
                  {/* Two Factor Auth */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-label-md text-on-surface font-semibold text-sm">Two-Factor Auth</p>
                      <p className="font-label-sm text-on-surface-variant text-xs">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`px-3 py-1.5 border rounded-md font-label-md text-xs transition-colors font-bold ${
                        twoFactor
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-surface-container-highest border-white/10 text-on-surface hover:bg-white/10"
                      }`}
                    >
                      {twoFactor ? "Enabled" : "Enable"}
                    </button>
                  </div>

                  {/* Password Change */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-label-md text-on-surface font-semibold text-sm">Last Password Change</p>
                      <p className="font-label-sm text-on-surface-variant text-xs">Updated 45 days ago</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance & Language Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary-container">palette</span>
                <h3 className="font-headline-md text-[20px] font-bold text-white">Appearance</h3>
              </div>
              <div className="glass-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Theme mode */}
                <div className="space-y-4">
                  <p className="font-label-md text-on-surface font-semibold text-sm">Theme Mode</p>
                  <div className="flex gap-2 p-1 bg-surface-container-lowest border border-white/5 rounded-xl">
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all text-xs font-semibold ${
                        themeMode === "light"
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">light_mode</span>
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all text-xs font-semibold ${
                        themeMode === "dark"
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Language Select */}
                <div className="space-y-4">
                  <p className="font-label-md text-on-surface font-semibold text-sm">Language</p>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2.5 text-on-surface font-label-md appearance-none focus:ring-1 focus:ring-primary focus:outline-none text-sm outline-none cursor-pointer"
                    >
                      <option className="bg-surface">English (US)</option>
                      <option className="bg-surface">Spanish (ES)</option>
                      <option className="bg-surface">German (DE)</option>
                      <option className="bg-surface">French (FR)</option>
                      <option className="bg-surface">Japanese (JP)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Device Sessions Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">devices</span>
                <h3 className="font-headline-md text-[20px] font-bold text-white">Active Sessions</h3>
              </div>
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div key={sess.id} className="glass-card rounded-xl p-3 flex items-center justify-between group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined">{sess.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-md text-on-surface text-sm font-semibold flex items-center gap-2">
                          <span className="truncate">{sess.device}</span>
                          {sess.current && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] rounded-full uppercase tracking-wider font-bold">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="font-label-sm text-on-surface-variant text-xs truncate">
                          {sess.location} • {sess.browser} • {sess.active}
                        </p>
                      </div>
                    </div>
                    {!sess.current && (
                      <button
                        onClick={() => handleTerminateSession(sess.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error p-1"
                        title="Logout session"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                      </button>
                    )}
                  </div>
                ))}
                {sessions.length > 1 && (
                  <button
                    onClick={handleTerminateAll}
                    className="w-full py-3 text-center font-label-md text-error hover:bg-error/5 rounded-xl transition-colors mt-2 text-sm font-semibold border border-dashed border-error/20"
                  >
                    Terminate all other sessions
                  </button>
                )}
              </div>
            </section>

            {/* Support & Legal footer links */}
            <footer className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a className="glass-card p-4 rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all" href="#">
                <span className="material-symbols-outlined text-primary-container">help</span>
                <div>
                  <p className="font-label-md text-on-surface text-sm font-semibold">Help Center</p>
                  <p className="font-label-sm text-on-surface-variant text-xs">FAQs and Tutorials</p>
                </div>
              </a>
              <a className="glass-card p-4 rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all" href="#">
                <span className="material-symbols-outlined text-secondary">description</span>
                <div>
                  <p className="font-label-md text-on-surface text-sm font-semibold">Terms &amp; Policy</p>
                  <p className="font-label-sm text-on-surface-variant text-xs">Legal information</p>
                </div>
              </a>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
