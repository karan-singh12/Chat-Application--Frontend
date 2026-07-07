"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: "Chats", path: "/dashboard", icon: "chat" },
    { name: "Friends", path: "/friends", icon: "group" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  const sidebarClass = `fixed top-0 bottom-0 left-0 h-screen w-64 md:w-sidebar-width bg-surface/50 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-primary/10 flex flex-col py-p-lg z-50 transition-all duration-300 md:translate-x-0 ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass}>
        <div className="px-4 md:px-0 mb-8 flex md:flex-col justify-between md:justify-center items-center gap-4">
          {/* Logo Mark for Desktop */}
          <div className="hidden md:flex w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-tertiary items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary/20 select-none">
            N
          </div>
          {/* Full Logo for Mobile Drawer */}
          <div className="md:hidden">
            <h1 className="font-headline-md text-headline-md font-extrabold bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
              NexusChat
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Online</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            className="md:hidden p-1 rounded-full hover:bg-white/10 text-on-surface-variant"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2 flex flex-col items-center md:items-stretch">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`w-full flex items-center justify-start md:justify-center gap-4 px-6 md:px-0 md:py-3 transition-all duration-300 active:scale-95 relative group ${
                  isActive
                    ? "bg-white/5 border-l-4 border-primary text-primary md:border-l-0 md:border-r-4 md:border-primary md:bg-primary/10"
                    : "text-on-surface-variant hover:bg-white/3 hover:text-on-surface md:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center md:w-full py-2">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                </div>
                {/* Text for Mobile */}
                <span className="font-label-md text-label-md md:hidden">{item.name}</span>
                {/* Tooltip for Desktop Hover */}
                <span className="hidden md:block absolute left-[76px] bg-surface-container-high border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 md:px-0 mt-auto flex flex-col items-center w-full">
          {/* Profile Card / Avatar Trigger */}
          <div className="relative group w-full flex justify-center mb-4">
            <div className="flex items-center gap-3 p-3 md:p-1 md:rounded-full rounded-xl bg-white/5 md:bg-transparent md:border md:border-white/10 w-full md:w-12 md:h-12 justify-center">
              <img
                className="w-10 h-10 md:w-full md:h-full rounded-full object-cover border border-white/10"
                alt="User Avatar"
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                }
              />
              <div className="flex-1 overflow-hidden md:hidden">
                <p className="font-label-md text-label-md truncate">{user?.username || "Alex Rivera"}</p>
                <p className="text-[10px] text-on-surface-variant opacity-60 uppercase tracking-widest">
                  {user?.isPro ? "Pro Member" : "Free Member"}
                </p>
              </div>
            </div>
            {/* Desktop Profile Info Tooltip */}
            <span className="hidden md:block absolute left-[76px] bg-surface-container-high border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl">
              {user?.username || "Profile"} ({user?.isPro ? "Pro" : "Free"})
            </span>
          </div>

          {/* Logout Trigger */}
          <div className="relative group w-full flex justify-center px-4 md:px-0">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full md:w-12 md:h-12 flex items-center justify-center gap-2 md:p-0 px-4 py-3 rounded-xl border border-white/10 text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                logout
              </span>
              <span className="font-label-md text-label-md md:hidden">Logout</span>
            </button>
            {/* Desktop Logout Tooltip */}
            <span className="hidden md:block absolute left-[76px] bg-red-950/80 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs text-red-300 font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl">
              Logout
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
