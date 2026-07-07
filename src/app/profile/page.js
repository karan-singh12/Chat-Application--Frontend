"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export default function ProfilePage() {
  const { user, setUser, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile forms fields state
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  // Sync state with local context user initially
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // Fetch complete profile from backend on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        if (refreshProfile) {
          const data = await refreshProfile();
          if (data) {
            setUsername(data.username || "");
            setBio(data.bio || "");
            setLocation(data.location || "");
            setPhone(data.phone || "");
            setAvatar(data.avatar || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [refreshProfile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await authService.updateProfile({
        username,
        bio,
        location,
        phone,
        avatar,
      });
      if (res.success && res.data) {
        setUser((prev) => {
          const updated = {
            ...prev,
            username: res.data.username,
            bio: res.data.bio,
            location: res.data.location,
            phone: res.data.phone,
            avatar: res.data.avatar,
          };
          localStorage.setItem("nexus_user", JSON.stringify(updated));
          return updated;
        });
        setIsEditing(false);
      } else {
        alert(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pb-12">
        {/* Page specific background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_45%)] pointer-events-none -z-10" />
        {/* Top App Bar */}
        <header className="sticky top-0 w-full bg-surface/30 backdrop-blur-md border-b border-white/10 h-16 flex justify-between items-center px-gutter z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md font-extrabold bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
              User Profile
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
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
            <div className="w-10 h-10 rounded-full border border-primary/30 p-0.5">
              <img
                className="w-full h-full object-cover rounded-full"
                alt="Mini Avatar"
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                }
              />
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="max-w-[1200px] mx-auto p-gutter w-full">
          {/* Hero Section: Banner & Main Profile Info */}
          <section className="relative mb-8">
            {/* Premium Banner */}
            <div className="w-full h-36 sm:h-48 rounded-3xl overflow-hidden glass-border relative group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLTjc57448BmuGCY5XwJGwo_JY4TDyFqiO9tfLydADLpburbsc6Tk3g5hqJmwOw3o4yM-X2IGm66NI3-BqXfOye8KEUbtGQxbxI2FKqrN6LOyG4AZvV8mqGbGQAYkqjKRs4eB_ykU-9WVdLOvFXj8RT-2phlXhALPEPphguTgZG51feT6JRETs98Tx2N2nQQ5dC9IOKVf6-T2h8p2dnKDd8Tc7koyHZrwLZpHVDgmVwrGetoh8ng0JNg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>

            {/* Profile Overlay */}
            <div className="absolute -bottom-10 left-6 sm:left-10 flex items-end gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-1 primary-gradient shadow-2xl">
                  <div className="w-full h-full rounded-xl overflow-hidden border-2 border-surface bg-surface">
                    <img
                      className="w-full h-full object-cover"
                      alt="User Avatar"
                      src={
                        avatar ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = prompt("Enter avatar image URL:", avatar);
                    if (url !== null) {
                      setAvatar(url);
                      setIsEditing(true);
                    }
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px]">edit</span>
                </button>
              </div>
              <div className="pb-4">
                <h3 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface font-bold">
                  {username}
                </h3>
                <p className="font-label-md text-label-md text-primary">
                  @{user?.email ? user.email.split("@")[0] : "vance_codes"}
                </p>
              </div>
            </div>
          </section>

          {/* Layout Grid: Bento Style */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-8 flex flex-col gap-6 w-full">
              {/* Bio Card */}
              <div className="glass-card p-5 rounded-2xl">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4 text-xs font-semibold">
                  About Me
                </h4>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50 min-h-[120px] resize-y"
                  />
                ) : (
                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed text-sm sm:text-base">
                    {bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm text-xs">
                    Product Design
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary font-label-sm text-label-sm text-xs">
                    TypeScript
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-container border border-white/5 text-on-surface-variant font-label-sm text-label-sm text-xs">
                    System Architecture
                  </span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-on-surface-variant text-xs">Email Address</p>
                    <p className="font-label-md text-label-md truncate text-sm">
                      {user?.email || "alexander.v@nexuschat.io"}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-on-surface-variant text-xs">Phone Number</p>
                    {isEditing ? (
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-transparent border-b border-white/20 text-white focus:outline-none focus:border-primary text-sm w-full py-0.5"
                      />
                    ) : (
                      <p className="font-label-md text-label-md truncate text-sm">{phone}</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-on-surface-variant text-xs">Location</p>
                    {isEditing ? (
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-transparent border-b border-white/20 text-white focus:outline-none focus:border-primary text-sm w-full py-0.5"
                      />
                    ) : (
                      <p className="font-label-md text-label-md truncate text-sm">{location}</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-on-surface-variant text-xs">Joined Date</p>
                    <p className="font-label-md text-label-md truncate text-sm">March 14, 2023</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Actions */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              {/* Stats Card */}
              <div className="glass-card p-5 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div>
                    <p className="text-2xl font-bold text-on-surface">1,284</p>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-widest text-xs font-semibold">
                      Friends
                    </p>
                  </div>
                  <div className="border-l border-white/10">
                    <p className="text-2xl font-bold text-on-surface">42</p>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-widest text-xs font-semibold">
                      Groups
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
               <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="primary-gradient w-full py-4 rounded-2xl font-label-md text-label-md text-on-primary font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">save</span>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl font-label-md text-label-md border border-white/10 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className="primary-gradient w-full py-4 rounded-2xl font-label-md text-label-md text-on-primary font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">edit_note</span>
                      Edit Profile
                    </button>
                    <button className="w-full py-4 rounded-2xl font-label-md text-label-md border border-white/10 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">lock_reset</span>
                      Change Password
                    </button>
                  </>
                )}
              </div>

              {/* Social Presence */}
              <div className="glass-card p-4 rounded-2xl">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6 text-xs font-semibold">
                  Social Networks
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] border border-[#1DA1F2]/20">
                        <span className="material-symbols-outlined">language</span>
                      </div>
                      <div>
                        <p className="font-label-md text-sm font-semibold">Twitter / X</p>
                        <p className="text-[11px] text-on-surface-variant">@vance_codes</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">
                      link
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <span className="material-symbols-outlined">public</span>
                      </div>
                      <div>
                        <p className="font-label-md text-sm font-semibold">GitHub</p>
                        <p className="text-[11px] text-on-surface-variant">github.com/vance-codes</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">
                      link
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-primary">Loading profile...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
