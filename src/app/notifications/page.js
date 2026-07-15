"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { getAvatarUrl } from "@/utils/avatar";

export default function NotificationsPage() {
  const { socket } = useChat();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "unread", "mentions", "system"
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resRequests, resFriends] = await Promise.all([
        authService.getFriendRequests("received"),
        authService.getFriendsList()
      ]);

      let reqs = [];
      let acceptedNotifs = [];

      if (resRequests.success && resRequests.data) {
        // Map pending friend requests
        reqs = resRequests.data.map((item) => ({
          id: item.id, // Friendship ID
          type: "friend_request",
          senderId: item.senderId,
          user: {
            name: item.sender.username || item.sender.email.split("@")[0],
            avatar: getAvatarUrl(item.sender.avatar),
          },
          text: "sent you a friend request",
          time: formatTime(item.createdAt),
          unread: true,
          category: "requests",
          actionable: true,
          status: "pending",
          icon: "person_add",
          iconColor: "text-primary bg-primary/10",
        }));
      }

      if (resFriends.success && resFriends.data) {
        // Map accepted requests where we were the sender
        acceptedNotifs = resFriends.data
          .filter((item) => item.senderId === user?.id)
          .map((item) => ({
            id: `accept_${item.friendshipId}`,
            type: "friend_accepted",
            user: {
              name: item.username || item.email.split("@")[0],
              avatar: getAvatarUrl(item.avatar),
            },
            text: "accepted your friend request",
            time: formatTime(item.updatedAt),
            unread: false,
            category: "requests",
            actionable: false,
            icon: "person_check",
            iconColor: "text-green-400 bg-green-500/10",
          }));
      }

      setNotifications([...reqs, ...acceptedNotifs]);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Socket listener for real-time incoming requests
  useEffect(() => {
    if (!socket) return;

    const handleIncomingRequest = (request) => {
      // Avoid duplicate rendering
      setNotifications((prev) => {
        if (prev.some((n) => n.id === request.id)) return prev;

        const newNotif = {
          id: request.id,
          type: "friend_request",
          senderId: request.sender.id,
          user: {
            name: request.sender.username || request.sender.email.split("@")[0],
            avatar: getAvatarUrl(request.sender.avatar),
          },
          text: "sent you a friend request",
          time: "Just now",
          unread: true,
          category: "requests",
          actionable: true,
          status: "pending",
          icon: "person_add",
          iconColor: "text-primary bg-primary/10",
        };
        return [newNotif, ...prev];
      });
    };

    const handleIncomingAcceptance = (acceptance) => {
      // Avoid duplicate rendering
      setNotifications((prev) => {
        if (prev.some((n) => n.id === `accept_${acceptance.id}`)) return prev;

        const newNotif = {
          id: `accept_${acceptance.id}`,
          type: "friend_accepted",
          user: {
            name: acceptance.user.username || acceptance.user.email.split("@")[0],
            avatar: getAvatarUrl(acceptance.user.avatar),
          },
          text: "accepted your friend request",
          time: "Just now",
          unread: true,
          category: "requests",
          actionable: false,
          icon: "person_check",
          iconColor: "text-green-400 bg-green-500/10",
        };
        return [newNotif, ...prev];
      });
    };

    socket.on("friendRequest", handleIncomingRequest);
    socket.on("acceptFriendRequest", handleIncomingAcceptance);
    return () => {
      socket.off("friendRequest", handleIncomingRequest);
      socket.off("acceptFriendRequest", handleIncomingAcceptance);
    };
  }, [socket]);

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, unread: false }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleRequestAction = async (id, action) => {
    try {
      const statusMap = {
        accepted: "ACCEPTED",
        declined: "REJECTED"
      };
      
      const notif = notifications.find((n) => n.id === id);
      const res = await authService.respondToFriendRequest(id, statusMap[action]);
      if (res.success) {
        if (action === "accepted" && notif && socket?.connected) {
          socket.emit("acceptFriendRequest", {
            targetUserId: notif.senderId,
            request: {
              id: id,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
              },
            },
          });
        }
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: action,
                  actionable: false,
                  text: action === "accepted" ? "accepted friend request" : "declined friend request",
                  unread: false,
                }
              : n
          )
        );
      }
    } catch (e) {
      console.error("Failed to respond to request:", e);
    }
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return n.unread;
    if (activeTab === "mentions") return n.category === "mentions";
    if (activeTab === "system") return n.category === "system";
    return true; // "all"
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />

        <div className="p-4 flex flex-col gap-6 max-w-[800px] mx-auto w-full">
          
          {/* Header */}
          <section className="pt-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-on-surface-variant font-bold mt-0.5">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification alerts`
                    : "No new notification alerts"}
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white font-bold rounded-full text-xs transition-all active:scale-97 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-white/5"
                >
                  Mark all read
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="px-4 py-2 bg-white/5 hover:bg-red-500/15 text-on-surface-variant hover:text-red-400 font-bold rounded-full text-xs transition-all active:scale-97 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-white/5"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none gap-2">
              {[
                { id: "all", label: "All Feed", count: notifications.length },
                { id: "unread", label: "Unread", count: unreadCount, isAlert: true },
                { id: "mentions", label: "Mentions", count: notifications.filter(n => n.category === "mentions").length },
                { id: "system", label: "System Alerts", count: notifications.filter(n => n.category === "system").length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 font-semibold relative transition-colors text-xs whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      tab.isAlert && unreadCount > 0 ? "bg-red-500/10 text-red-400" : "bg-white/10 text-on-surface-variant"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Notifications Feed Cards */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group bg-surface-container/30 border rounded-xl p-3.5 flex items-start gap-4 transition-all duration-300 ${
                    notif.unread ? "border-primary/20 bg-primary/[0.01]" : "border-white/5 hover:bg-surface-container-high/45"
                  }`}
                >
                  {/* Category Status Icon / Avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    {notif.system ? (
                      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center ${notif.iconColor}`}>
                        <span className="material-symbols-outlined text-[16px]">{notif.icon}</span>
                      </div>
                    ) : (
                      <Link href={`/profile/${notif.user.name}`} className="relative hover:opacity-85 transition-opacity block">
                        <img
                          className="w-8.5 h-8.5 rounded-full object-cover border border-white/10"
                          src={notif.user.avatar}
                          alt={notif.user.name}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-background-app text-[10px] ${notif.iconColor}`}>
                          <span className="material-symbols-outlined text-[11px] font-bold">{notif.icon}</span>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-4 mb-0.5">
                      <p className="text-xs text-white leading-normal">
                        {!notif.system && (
                          <Link href={`/profile/${notif.user.name}`} className="hover:underline">
                            <span className="font-bold mr-1 text-white">{notif.user.name}</span>
                          </Link>
                        )}
                        <span className="text-on-surface-variant">{notif.text}</span>
                      </p>
                      <span className="text-[9px] text-on-surface-variant/40 font-bold whitespace-nowrap flex-shrink-0 select-text">
                        {notif.time}
                      </span>
                    </div>

                    {/* Actionable button row (e.g. friend requests) */}
                    {notif.actionable && notif.status === "pending" && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <button
                          onClick={() => handleRequestAction(notif.id, "accepted")}
                          className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-full text-[9px] hover:brightness-110 transition-all cursor-pointer shadow-sm shadow-primary/10"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleRequestAction(notif.id, "declined")}
                          className="px-3.5 py-1.5 bg-white/5 text-on-surface-variant hover:text-white font-bold rounded-full text-[9px] hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mark single as Read/Unread Trigger */}
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant flex items-center justify-center self-center cursor-pointer flex-shrink-0"
                    title={notif.unread ? "Mark as read" : "Mark as unread"}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {notif.unread ? "mark_email_read" : "mark_email_unread"}
                    </span>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-surface-container/10 p-12 text-center rounded-xl border border-white/5 select-none">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-high/40 border border-white/5 flex items-center justify-center text-on-surface-variant/20 mx-auto mb-4">
                  <span className="material-symbols-outlined text-[24px]">notifications_off</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No notifications</h3>
                <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  Notifications about mentions, reactions, friend requests, and system announcements will appear in this feed.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
