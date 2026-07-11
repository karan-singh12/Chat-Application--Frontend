"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, onClose, hideMobileNav }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: "Chats", path: "/dashboard", icon: "chat" },
    { name: "Friends", path: "/friends", icon: "group" },
    { name: "Notifications", path: "/notifications", icon: "notifications" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="fixed top-0 bottom-0 left-0 h-screen w-sidebar-width bg-surface-container-low border-r border-white/5 flex flex-col py-5 z-50 hidden md:flex items-center justify-between">
        {/* Top Logo */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center select-none hover:scale-105 hover:rotate-2 transition-all duration-300">
            <svg className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <rect x="20" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1)" />
              <rect x="65" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1)" />
              <path d="M27.5 18 L72.5 82" stroke="url(#logo-grad-2)" strokeWidth="15" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="w-full flex flex-col gap-4 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className="group flex flex-col items-center w-full relative transition-all duration-300 py-1"
              >
                {/* Active Highlight Capsule */}
                <div
                  className={`w-9 h-7.5 rounded-lg flex items-center justify-center transition-all duration-300 relative ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[17px] transition-transform duration-200 group-hover:scale-105"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                </div>
                
                {/* Desktop Hover Tooltip */}
                <div className="absolute left-[48px] bg-surface-container-high border border-white/10 px-2 py-1 rounded-md text-[9px] text-white font-bold whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl">
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Avatar & Logout */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          <Link href="/profile" className="group relative flex justify-center w-8 h-8 rounded-full border border-white/10 p-0.5 hover:border-primary/50 transition-colors">
            <img
              className="w-full h-full rounded-full object-cover"
              alt="Avatar"
              src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"}
            />
            <div className="absolute left-[48px] bg-surface-container-high border border-white/10 px-2 py-1 rounded-md text-[9px] text-white font-bold whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl">
              Profile Settings
            </div>
          </Link>

          <button
            onClick={logout}
            className="group relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-all duration-300 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] transition-transform duration-300 group-hover:scale-105">
              logout
            </span>
            <div className="absolute left-[48px] bg-red-950/80 border border-red-500/20 px-2 py-1 rounded-md text-[9px] text-red-300 font-bold whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl">
              Logout
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar (visible only on mobile) */}
      <header className={`fixed top-0 left-0 right-0 h-14 bg-surface-container-low/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40 md:hidden shadow-sm ${hideMobileNav ? "hidden" : ""}`}>
        {/* App Logo & Brand Name */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 flex items-center justify-center">
            <svg className="w-full h-full filter drop-shadow-[0_1.5px_6px_rgba(99,102,241,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad-1-mob" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="logo-grad-2-mob" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <rect x="20" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1-mob)" />
              <rect x="65" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1-mob)" />
              <path d="M27.5 18 L72.5 82" stroke="url(#logo-grad-2-mob)" strokeWidth="15" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-extrabold text-xs tracking-tight">NexusChat</span>
        </div>

        {/* Right Side Icon: Profile */}
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          <Link
            href="/profile"
            className={`w-7 h-7 rounded-full border p-0.5 transition-colors ${
              pathname === "/profile" ? "border-primary" : "border-white/10"
            }`}
          >
            <img
              className="w-full h-full rounded-full object-cover"
              alt="Avatar"
              src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"}
            />
          </Link>
        </div>
      </header>
      
      {/* Top spacer for mobile content layout flow */}
      <div className={`h-14 md:hidden flex-shrink-0 ${hideMobileNav ? "hidden" : ""}`} />

      {/* Mobile Bottom Navigation Bar (visible only on mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 md:hidden pb-safe shadow-xl ${hideMobileNav ? "hidden" : ""}`}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 py-1 relative group active:scale-95 transition-transform"
            >
              {/* Active highlights capsule */}
              <div
                className={`w-12 h-7.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? "bg-primary/20 text-primary" : "text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
              </div>
              <span className={`text-[9px] mt-1 font-semibold ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
