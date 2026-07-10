"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: "Feed", path: "/feed", icon: "feed" },
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-fixed-dim flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20 select-none hover:scale-103 transition-transform duration-300">
            N
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

      {/* Mobile Bottom Navigation Bar (visible only on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 md:hidden pb-safe shadow-xl">
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
        {/* Avatar linked to profile */}
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
        >
          <div className={`w-7 h-7 rounded-full border p-0.5 transition-colors ${pathname === "/profile" ? "border-primary" : "border-white/10"}`}>
            <img
              className="w-full h-full rounded-full object-cover"
              alt="Avatar"
              src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"}
            />
          </div>
          <span className={`text-[9px] mt-1 font-semibold ${pathname === "/profile" ? "text-primary" : "text-on-surface-variant"}`}>
            Profile
          </span>
        </Link>
      </nav>
    </>
  );
}
