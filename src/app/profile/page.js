"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { SOCKET_URL } from "@/config/api";
import { useChat } from "@/context/ChatContext";

export default function ProfilePage() {
  const { user, setUser, refreshProfile } = useAuth();
  const { chats } = useChat();
  const [friendsCount, setFriendsCount] = useState(0);
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

  // Load friends count dynamically
  useEffect(() => {
    authService.getFriendsList().then((res) => {
      if (res.success && res.data) {
        setFriendsCount(res.data.length);
      }
    }).catch(() => {});
  }, []);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const res = await authService.uploadAvatar(file);
      if (res.success && res.data) {
        const absoluteUrl = res.data.url.startsWith("http")
          ? res.data.url
          : `${SOCKET_URL}${res.data.url}`;
        setAvatar(absoluteUrl);
        setIsEditing(true);
      } else {
        alert(res.message || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert(err.message || "An error occurred while uploading avatar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />



        {/* Profile Content */}
        <div className="max-w-[800px] mx-auto p-4 w-full space-y-6">
          
          {/* Banner & Avatar Hero container */}
          <section className="relative">
            {/* Premium Banner */}
            <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden border border-white/5 relative group shadow-md">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-103"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLTjc57448BmuGCY5XwJGwo_JY4TDyFqiO9tfLydADLpburbsc6Tk3g5hqJmwOw3o4yM-X2IGm66NI3-BqXfOye8KEUbtGQxbxI2FKqrN6LOyG4AZvV8mqGbGQAYkqjKRs4eB_ykU-9WVdLOvFXj8RT-2phlXhALPEPphguTgZG51feT6JRETs98Tx2N2nQQ5dC9IOKVf6-T2h8p2dnKDd8Tc7koyHZrwLZpHVDgmVwrGetoh8ng0JNg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-app/90 via-background-app/20 to-transparent"></div>
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute -bottom-8 left-4 sm:left-6 flex items-end gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-fixed-dim shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-surface bg-surface">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      alt="User Avatar"
                      src={
                        avatar ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA";
                      }}
                    />
                  </div>
                </div>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => document.getElementById("avatar-file-input")?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-md cursor-pointer animate-fade-in"
                  title="Upload profile photo"
                >
                  <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                </button>
              </div>
              <div className="pb-2 select-text">
                {isEditing ? (
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-surface-container-low border border-white/10 text-white font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary max-w-[150px] sm:max-w-[200px]"
                    placeholder="Username"
                  />
                ) : (
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {username}
                  </h3>
                )}
                <p className="text-[10px] text-primary font-semibold mt-0.5">
                  @{user?.email ? user.email.split("@")[0] : "nexus_member"}
                </p>
              </div>
            </div>
          </section>

          {/* Grid Layout: Bento Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-6">
            
            {/* Left Column (Bio + Personal Fields) */}
            <div className="lg:col-span-8 flex flex-col gap-5 w-full">
              {/* Bio Card */}
              <div className="bg-surface-container/30 border border-white/5 rounded-xl p-4 shadow-md">
                <h4 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase mb-3 ml-1">
                  About Me
                </h4>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50 focus:bg-surface-container-low/80 transition-all min-h-[90px] resize-y placeholder:text-on-surface-variant/40"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-xs text-on-surface leading-relaxed ml-1">
                    {bio || "No biography provided yet."}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4 ml-1">
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] uppercase tracking-wider">
                    Product Design
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-on-surface-variant font-bold text-[9px] uppercase tracking-wider">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-on-surface-variant font-bold text-[9px] uppercase tracking-wider">
                    Web Architecture
                  </span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-surface-container/30 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</p>
                    <p className="font-semibold text-xs text-white truncate mt-0.5 select-text">
                      {user?.email || "member@nexuschat.io"}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container/30 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</p>
                    {isEditing ? (
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-transparent border-b border-white/10 text-white focus:outline-none focus:border-primary text-xs w-full py-0.5 mt-0.5"
                        placeholder="Add phone number"
                      />
                    ) : (
                      <p className="font-semibold text-xs text-white truncate mt-0.5">
                        {phone || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container/30 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Location</p>
                    {isEditing ? (
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-transparent border-b border-white/10 text-white focus:outline-none focus:border-primary text-xs w-full py-0.5 mt-0.5"
                        placeholder="Add location"
                      />
                    ) : (
                      <p className="font-semibold text-xs text-white truncate mt-0.5 select-text">
                        {location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container/30 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Joined Date</p>
                    <p className="font-semibold text-xs text-white truncate mt-0.5">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Joined recently"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Stats, Save/Edit Actions, Socials) */}
            <div className="lg:col-span-4 flex flex-col gap-5 w-full">
              {/* Stats Card */}
              <div className="bg-surface-container/30 border border-white/5 p-4 rounded-xl text-center relative overflow-hidden shadow-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">{friendsCount}</p>
                    <p className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase mt-0.5">
                      Friends
                    </p>
                  </div>
                  <div className="border-l border-white/5">
                    <p className="text-lg font-bold text-white">
                      {chats ? chats.filter((c) => c.type === "group").length : 0}
                    </p>
                    <p className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase mt-0.5">
                      Groups
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-surface-container/30 border border-white/5 p-3.5 rounded-xl flex flex-col gap-2.5 shadow-md">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-primary w-full py-2.5 rounded-full text-white font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-full border border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-white font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className="btn-primary w-full py-2.5 rounded-full text-white font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Edit Profile
                    </button>
                    <button className="w-full py-2.5 rounded-full border border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-white font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer text-xs">
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      Change Password
                    </button>
                  </>
                )}
              </div>

              {/* Social Presence */}
              <div className="bg-surface-container/30 border border-white/5 p-4 rounded-xl shadow-md">
                <h4 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase mb-3 ml-1">
                  Social Networks
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] border border-[#1DA1F2]/20 flex-shrink-0">
                        <span className="material-symbols-outlined text-[16px]">language</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Twitter / X</p>
                        <p className="text-[9px] text-on-surface-variant mt-0.5">@vance_codes</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                      link
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        <span className="material-symbols-outlined text-[16px]">public</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">GitHub</p>
                        <p className="text-[9px] text-on-surface-variant mt-0.5">github.com/vance-codes</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                      link
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase">Saving Changes...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
