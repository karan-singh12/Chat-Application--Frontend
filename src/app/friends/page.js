"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export default function FriendsPage() {
  const router = useRouter();
  const { chats, selectChat, getOrCreateChat } = useChat();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list"); // "list", "requests", "sent"
  const [searchQuery, setSearchQuery] = useState("");

  // Add Friend Modal states
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendInput, setNewFriendInput] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState(null);

  // Dynamic states
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]); // received
  const [sentRequests, setSentRequests] = useState([]); // sent
  const [isLoading, setIsLoading] = useState(false);

  const fetchConnectionsData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch friends list
      const friendsRes = await authService.getFriendsList();
      if (friendsRes.success && friendsRes.data) {
        const mappedFriends = friendsRes.data.map(item => ({
          id: item.username || item.id.toString(),
          userId: item.id,
          friendshipId: item.friendshipId,
          name: item.username || item.email.split("@")[0],
          avatar: item.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
          mutual: 0,
          status: "online",
          activity: item.bio || "Active member",
        }));
        setFriends(mappedFriends);
      }

      // 2. Fetch friend requests
      const requestsRes = await authService.getFriendRequests();
      if (requestsRes.success && requestsRes.data) {
        const currentUserId = user?.id;
        const received = [];
        const sent = [];

        requestsRes.data.forEach(req => {
          if (req.receiverId === currentUserId) {
            received.push({
              id: req.id,
              senderId: req.senderId,
              name: req.sender.username || req.sender.email.split("@")[0],
              avatar: req.sender.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
            });
          } else if (req.senderId === currentUserId) {
            sent.push({
              id: req.id,
              receiverId: req.receiverId,
              name: req.receiver.username || req.receiver.email.split("@")[0],
              avatar: req.receiver.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
            });
          }
        });

        setRequests(received);
        setSentRequests(sent);
      }

      // 3. Fetch friend suggestions
      const suggestionsRes = await authService.getFriendSuggestions();
      if (suggestionsRes.success && suggestionsRes.data) {
        setSuggestions(suggestionsRes.data.map(item => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
          detail: item.detail,
          added: false
        })));
      }
    } catch (err) {
      console.error("Error fetching connections data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConnectionsData();
    }
  }, [user?.id]);

  const handleMessageFriend = async (friendId) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;

    setIsLoading(true);
    try {
      await getOrCreateChat(friend.id, friend.name, friend.avatar);
      router.push(`/dashboard?chat=${friend.id}`);
    } catch (err) {
      console.error("Failed to message friend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setIsLoading(true);
    try {
      const res = await authService.removeFriend(friendId);
      if (res.success) {
        await fetchConnectionsData();
      } else {
        alert(res.message || "Failed to remove friend");
      }
    } catch (err) {
      console.error("Error removing friend:", err);
      alert(err.message || "Error removing friend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (suggestionId) => {
    try {
      const sug = suggestions.find(s => s.id === suggestionId);
      if (!sug) return;
      const res = await authService.sendFriendRequest(sug.name);
      if (res.success) {
        setSuggestions(prev =>
          prev.map(s => s.id === suggestionId ? { ...s, added: true } : s)
        );
        fetchConnectionsData();
      } else {
        alert(res.message || "Failed to send friend request");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert(err.message || "Error sending friend request");
    }
  };

  const handleAcceptRequest = async (req) => {
    setIsLoading(true);
    try {
      const res = await authService.respondToFriendRequest(req.id, "ACCEPTED");
      if (res.success) {
        await fetchConnectionsData();
      } else {
        alert(res.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert(err.message || "Error accepting request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineRequest = async (reqId) => {
    setIsLoading(true);
    try {
      const res = await authService.respondToFriendRequest(reqId, "REJECTED");
      if (res.success) {
        await fetchConnectionsData();
      } else {
        alert(res.message || "Failed to decline request");
      }
    } catch (err) {
      console.error("Error declining request:", err);
      alert(err.message || "Error declining request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriendSubmit = async () => {
    if (!newFriendInput.trim()) {
      setAddFriendStatus({ type: "error", message: "Please enter a username or email address." });
      return;
    }
    try {
      const res = await authService.sendFriendRequest(newFriendInput.trim());
      if (res.success) {
        setAddFriendStatus({
          type: "success",
          message: res.message || `Connection request sent to "${newFriendInput}"!`,
        });
        setTimeout(() => {
          setIsAddFriendOpen(false);
          setNewFriendInput("");
          setAddFriendStatus(null);
          fetchConnectionsData();
        }, 2000);
      } else {
        setAddFriendStatus({ type: "error", message: res.message || "Failed to send request" });
      }
    } catch (err) {
      console.error("Error sending request:", err);
      setAddFriendStatus({ type: "error", message: err.message || "An error occurred." });
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />

        <div className="p-4 flex flex-col gap-6 max-w-[960px] mx-auto w-full">
          
          {/* Header */}
          <section className="pt-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                  Connections
                </h1>
                <p className="text-[10px] text-on-surface-variant font-bold mt-0.5">
                  Manage colleagues and chat contacts
                </p>
              </div>
              <button
                onClick={() => setIsAddFriendOpen(true)}
                className="btn-primary text-white px-4 py-2 rounded-full font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-99 transition-all shadow-md shadow-primary/10 self-start sm:self-auto cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Add Friend
              </button>
            </div>

            {/* Custom Navigation Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 gap-3">
              <div className="flex overflow-x-auto scrollbar-none gap-2">
                {[
                  { id: "list", label: "Friends", count: friends.length },
                  { id: "requests", label: "Requests", count: requests.length, isAlert: true },
                  { id: "sent", label: "Sent Requests", count: sentRequests.length }
                ].map(tab => (
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
                        tab.isAlert ? "bg-red-500/10 text-red-400" : "bg-white/10 text-on-surface-variant"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="w-full md:w-64 relative group pb-1.5 md:pb-0">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-[16px]">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-high/50 border border-white/5 rounded-full py-1.5 pl-8.5 pr-4 text-xs focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all text-white placeholder:text-on-surface-variant/45"
                  placeholder="Search connections..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Grid Layout: Main list vs suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Friends Cards Stack (Left Column) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {activeTab === "list" && (
                <>
                  <div className="flex items-center justify-between px-1.5">
                    <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase">
                      All Friends ({filteredFriends.length})
                    </h3>
                  </div>

                  {filteredFriends.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="group bg-surface-container/30 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-all duration-300"
                        >
                          <Link href={`/profile/${friend.id}`} className="flex items-center gap-3 hover:opacity-85 transition-all">
                            <div className="relative">
                              <img
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                alt={friend.name}
                                src={friend.avatar}
                              />
                              <div className={`status-dot absolute bottom-0.5 right-0.5 status-${friend.status}`}></div>
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-white group-hover:text-primary transition-colors">
                                {friend.name}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
                                {friend.activity}
                              </p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMessageFriend(friend.id)}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 text-on-surface-variant hover:text-primary flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                              title="Message"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.userId)}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 text-on-surface-variant hover:text-red-400 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                              title="Remove Friend"
                            >
                              <span className="material-symbols-outlined text-[16px]">person_remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container/10 p-10 text-center rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-30 mb-2">
                        person_search
                      </span>
                      <p className="text-on-surface-variant text-xs">No connections matching "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "requests" && (
                <>
                  <div className="px-1.5">
                    <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase">
                      Incoming Requests ({requests.length})
                    </h3>
                  </div>
                  {requests.length > 0 ? (
                    <div className="space-y-2">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-surface-container/30 border border-white/5 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                              alt={req.name}
                              src={req.avatar}
                            />
                            <div>
                              <h4 className="font-bold text-xs text-white">{req.name}</h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">Wants to chat</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleAcceptRequest(req)}
                              className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-full hover:brightness-110 text-[10px] transition-all active:scale-95 shadow-md shadow-primary/10 cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="px-3.5 py-1.5 bg-white/10 text-on-surface-variant font-bold rounded-full hover:bg-white/20 text-[10px] transition-all active:scale-95 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container/10 p-10 text-center rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-30 mb-2">
                        mail
                      </span>
                      <p className="text-on-surface-variant text-xs">No connection requests</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "sent" && (
                <>
                  <div className="px-1.5">
                    <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase">
                      Sent Requests ({sentRequests.length})
                    </h3>
                  </div>
                  {sentRequests.length > 0 ? (
                    <div className="space-y-2">
                      {sentRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-surface-container/30 border border-white/5 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                              alt={req.name}
                              src={req.avatar}
                            />
                            <div>
                              <h4 className="font-bold text-xs text-white">{req.name}</h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">Awaiting approval</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                            Sent
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container/10 p-10 text-center rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-30 mb-2">
                        send
                      </span>
                      <p className="text-on-surface-variant text-xs">No sent requests</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Suggestions Sidebar (Right Column) */}
            <div className="lg:col-span-4 flex flex-col gap-4 w-full">
              
              {/* Suggestion Card */}
              <div className="bg-surface-container/30 border border-white/5 rounded-xl p-5 shadow-md">
                <h3 className="text-xs text-white font-bold mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  Suggestions
                </h3>
                
                <div className="space-y-3">
                  {suggestions.map((sug) => (
                    <div key={sug.id} className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                          alt={sug.name}
                          src={sug.avatar}
                        />
                        <div className="overflow-hidden">
                          <h5 className="font-semibold text-xs text-white truncate">{sug.name}</h5>
                          <p className="text-[9px] text-on-surface-variant truncate mt-0.5">{sug.detail}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(sug.id)}
                        disabled={sug.added}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                          sug.added
                            ? "bg-green-500/10 text-green-400 cursor-default"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {sug.added ? "done" : "person_add"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-1.5 border border-white/5 text-on-surface-variant hover:text-white hover:bg-white/5 font-semibold text-[10px] rounded-full transition-all cursor-pointer">
                  Find More People
                </button>
              </div>

              {/* Pending Request Mini Card (Hidden on Mobile) */}
              {requests.length > 0 && (
                <div className="bg-surface-container/30 border border-white/5 rounded-xl p-5 hidden lg:block shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[9px] font-bold tracking-widest text-on-surface-variant/50 uppercase">
                      Pending
                    </h3>
                    <button onClick={() => setActiveTab("requests")} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {requests.slice(0, 1).map((req) => (
                      <div key={req.id} className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                          alt={req.name}
                          src={req.avatar}
                        />
                        <div className="flex-1 overflow-hidden">
                          <h5 className="font-semibold text-xs text-white truncate">{req.name}</h5>
                          <div className="flex gap-1 mt-1.5">
                            <button
                              onClick={() => handleAcceptRequest(req)}
                              className="px-2 py-0.5 bg-primary text-white text-[9px] rounded-full hover:brightness-110 font-bold cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="px-2 py-0.5 bg-white/10 text-on-surface-variant text-[9px] rounded-full hover:bg-white/20 font-bold cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Dialog */}
        {isAddFriendOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-container w-full max-w-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-scale-in p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
                  <h3 className="text-xs font-bold text-white">Add New Friend</h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddFriendOpen(false);
                    setNewFriendInput("");
                    setAddFriendStatus(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Enter their unique username or email address below to send them a connection request.
                </p>
                
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                    alternate_email
                  </span>
                  <input
                    value={newFriendInput}
                    onChange={(e) => setNewFriendInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-on-surface-variant/40 text-white"
                    placeholder="Username or email address..."
                    type="text"
                    autoFocus
                  />
                </div>

                {addFriendStatus && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    addFriendStatus.type === "success" 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {addFriendStatus.message}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setIsAddFriendOpen(false);
                    setNewFriendInput("");
                    setAddFriendStatus(null);
                  }}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-on-surface-variant rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFriendSubmit}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-full text-xs transition-all active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase">Loading...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
