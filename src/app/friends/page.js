"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/context/ChatContext";

export default function FriendsPage() {
  const router = useRouter();
  const { chats, selectChat } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list"); // "list", "requests", "sent"
  const [searchQuery, setSearchQuery] = useState("");

  // Add Friend Modal states
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendInput, setNewFriendInput] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState(null);

  // Friends mock list
  const [friends, setFriends] = useState([
    {
      id: "elena_vance",
      name: "Elena Vance",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG1YAn1jgh16n6WV7S7s9CT3EMMEubxoX5DCgb3sd0VkQu22BbUNqWdySB2LLWSNuB6WIHEadOfZ7HITCJ886O_JPymsmXlB2YGWfp4lTEto8uTxxA8SEuq-rupfq9bWtKhYSlDRfgg59R0HDF3O1lftyLiMTyrmY1mc4j72zso9bYqk4NadrOVH9_6vxdudBJ98QZJiFERNShjVJGzOxL34sqSUANlTUqGrjbEuZCBa8c2QZxOilBJQ",
      mutual: 12,
      status: "online",
      activity: "Playing: Cyberpunk 2077",
    },
    {
      id: "sarah_connor",
      name: "Sarah Connor",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARbWQh94SFZTAopxT4oZQx3jy4PupN9yR9lZSF8voGbb4lQzXMnrL_M7-FGC2pHGSJBlQgWIWqhe2B-MKe6yiU24jjRK-Tqbez7KBbtzh55Go9QKvbMLyP0UN6GfP0jkeasS5N3PdMgb59Ss-IDX1zcljSQyJCnoG_gUOA4XqeZ0dr719km4hci0fiN-eNW116ski97MuQChrnD2YqFRs-VQpo-lKv416sMJX1TFe-ew9QPsk7L_gEaQ",
      mutual: 8,
      status: "idle",
      activity: "Away for 15m",
    },
    {
      id: "marcus_thorne",
      name: "Marcus Thorne",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMauQABRg0C2WuBIT87DLe7DHj_rI6fIP4_vc1WpodcmsXK_bii9yHkY6fG3wkSnasRcmMhWgXDftaHxEVGKrzhpEICUM-rT8G8w9-by8QS3yRPqCERRfihGMMAVPo7ekjL2EIvcSS6_BzIAdgmulgMoQyo3B3PzAuA7NLvtYsgM4Yk2tdgOv585I-qJXvzOhIXXwFyE76NHMFyqfjhDER7lU0XUMW0NUpo7Ex1ol4ITN3GqRI08yPHA",
      mutual: 2,
      status: "offline",
      activity: "Last seen 2h ago",
    },
    {
      id: "elena_voss",
      name: "Elena Voss",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2yVDZUMwuerfRX2w9MzP9Q5dUDwX1tK1vsUJtiPhFXPInRrLRuSP9Xpil24-oLTIT_NMtKcD9GI0zkgXzaEEkgEgqSPWtz4VDFNsU7Vjf3UwATKhGQp3gk-QIdHdCzC-j3wgKIj4SN2UPLkAE6SCQksvEFkGn63qGDLeY0w0v_A_NhUSC9VWZweGlfd2_C6XbjLjcwRNh-FlqT9ToipmpqMz7n3r43SnhV7b_mYvzbH16PYbrNNxe5w",
      mutual: 32,
      status: "online",
      activity: "Coding in VS Code",
    }
  ]);

  // Suggestions mock list
  const [suggestions, setSuggestions] = useState([
    {
      id: "jordan_dev",
      name: "Jordan_Dev",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBINY-c3dKkQVnrvRcb5jjqB3W3NLpwB0Mw8XJ2tYuGfrLrv4NVxNVyqjfbivGzReH2ddIM0MvHGQ4SrCY1ttgDI_a2WfP970uB2R7j4czA-OPKmKDh8AcW_5jCbafJXDwRU880PvuWRpZkNXZA7rIl52bWlWv74ua-anFOhR8fJLcnTaF0Gdo0a7SAnIw9g5qk68KbucdTzRZnGktrF1J6RtMcdmSNAwvfVTd4wixWyDKAPu0ngPry1Q",
      detail: "4 mutual friends",
      added: false,
    },
    {
      id: "aria_design",
      name: "Aria_Design",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkf2yslvjBIeONIK6YT5cxlliYTGPZoTrI7ZnwEyKmqj4blrlJxeZMPAP-GRdoYD6xe_3bJ7tCPFiiy2mUfUi0atBVyzIT3W2uJuQRKGPobGHLMZuOdfX9Hfyghucjlx19qrdmbtdtFl0_PQ-SCAgjmIqKQc8COM2caXLTBf31-SBk4_9jc40JXutQoPVrOKltXyGqzFnE5jwHJcd2-973JqsRey38WbcW4yEB-KIfhKw_TRxUfWcd7A",
      detail: "12 mutual friends",
      added: false,
    },
    {
      id: "thomas_net",
      name: "Thomas_Net",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkJ9evgslqMdEfWWyIFTkIzJjokQzJjri8CJ-r_Xf4DsU_3GLbNHOUKne6f0-GknV46FUcNX1fLxo5q0jno8gIQY2ZmwbN5QXWf02CIfoBPKlw2Le-BglUBODJtiTYU9ALX5uEm8IU1QWI_7vVxLRbgFZOPDP2Fw2N6nvF_cUMeuWrUu56v9URg9CT_60cguZyTk0arfOGKKt_7C5j1jN22sBRSk6OsMRB0CKMYyX9hvwsPNumpBOTFQ",
      detail: "Shared group: Nexus Devs",
      added: false,
    }
  ]);

  // Pending requests mock list
  const [requests, setRequests] = useState([
    {
      id: "mia_rivers",
      name: "Mia.Rivers",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmh5lvfzdknsknn3EM1M-Jf7bzZONvlHYopt-3bH2ZBUfjWNsHUREMj2ZQjG-E83RRJ3LMn2FrzO1nMH1LQU5ceSG7Bj-gf3gvaKLCg4_PNkBG6-vEvW5Di3XiywT1vGsStFLwxW9Z43dd8T7_4zItrqnWfedQqXQVNoOQCUD2aQBcJCAdnyULdl-Ghf2UT1mHRYf1fmhz0Ay6aJ5D1OELKyJp24fKJfKjPeTRbFVXofa3TVN2B6wFng",
    }
  ]);

  const handleMessageFriend = (friendId) => {
    const chatMatch = chats.find((c) => c.id === friendId);
    if (chatMatch) {
      selectChat(chatMatch);
      router.push("/dashboard");
    }
  };

  const handleRemoveFriend = (friendId) => {
    setFriends(friends.filter((f) => f.id !== friendId));
  };

  const handleAddFriend = (suggestionId) => {
    setSuggestions(
      suggestions.map((s) => (s.id === suggestionId ? { ...s, added: true } : s))
    );
  };

  const handleAcceptRequest = (req) => {
    setRequests(requests.filter((r) => r.id !== req.id));
    // Add to friends list
    setFriends([
      ...friends,
      {
        id: req.id,
        name: req.name,
        avatar: req.avatar,
        mutual: 3,
        status: "online",
        activity: "Recently joined",
      }
    ]);
  };

  const handleDeclineRequest = (reqId) => {
    setRequests(requests.filter((r) => r.id !== reqId));
  };

  const handleAddFriendSubmit = () => {
    if (!newFriendInput.trim()) {
      setAddFriendStatus({ type: "error", message: "Please enter a username or email address." });
      return;
    }
    setAddFriendStatus({ type: "success", message: `Connection request sent to "${newFriendInput}"!` });
    setTimeout(() => {
      setIsAddFriendOpen(false);
      setNewFriendInput("");
      setAddFriendStatus(null);
    }, 2000);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background flex min-h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar">
        {/* Page specific background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_45%)] pointer-events-none -z-10" />
        


        {/* Main Content Body */}
        <div className="p-gutter flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
          
          {/* Management Header */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Manage Connections</h2>
                  <p className="text-on-surface-variant font-body-md text-sm">
                    Keep track of your network and meet new people.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFriendOpen(true)}
                className="primary-gradient text-white px-6 py-2.5 rounded-full font-label-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add New Friend
              </button>
            </div>

            {/* Custom Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 gap-4 pb-1 relative">
              <div className="flex overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-6 py-3 font-label-md relative transition-colors whitespace-nowrap ${
                    activeTab === "list" ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Friends List
                  {activeTab === "list" && <div className="active-tab-indicator" />}
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-6 py-3 font-label-md relative transition-colors whitespace-nowrap ${
                    activeTab === "requests" ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Friend Requests
                  {requests.length > 0 && (
                    <span className="ml-2 bg-error-container text-on-error-container text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {requests.length}
                    </span>
                  )}
                  {activeTab === "requests" && <div className="active-tab-indicator" />}
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`px-6 py-3 font-label-md relative transition-colors whitespace-nowrap ${
                    activeTab === "sent" ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Sent Requests
                  {activeTab === "sent" && <div className="active-tab-indicator" />}
                </button>
              </div>

              {/* Header Search bar relocated here */}
              <div className="w-full md:w-72 relative group mb-2 md:mb-0 mr-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 group-focus-within:text-primary transition-colors text-[18px]">
                  search
                </span>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary focus:bg-white/10 transition-all text-white placeholder:text-on-surface-variant/40"
                  placeholder="Search friends..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Layout Grid: Suggested vs Main List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Friends Cards Stack (Left) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {activeTab === "list" && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                      All Friends ({filteredFriends.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant font-label-sm text-xs">Sort by:</span>
                      <select className="bg-transparent border-none text-primary font-label-md text-sm focus:ring-0 cursor-pointer outline-none">
                        <option className="bg-surface">Recently Online</option>
                        <option className="bg-surface">Alphabetical</option>
                        <option className="bg-surface">Mutual Friends</option>
                      </select>
                    </div>
                  </div>

                  {filteredFriends.length > 0 ? (
                    <div className="space-y-3">
                      {filteredFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="group bg-surface-container/40 backdrop-blur-sm border border-white/5 rounded-xl p-2.5 flex items-center justify-between hover:bg-white/5 hover:border-primary/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                alt={friend.name}
                                src={friend.avatar}
                              />
                              <div className={`status-dot absolute bottom-0.5 right-0.5 status-${friend.status}`}></div>
                            </div>
                            <div>
                              <h4 className="font-headline-md text-sm text-on-surface group-hover:text-primary transition-colors font-bold">
                                {friend.name}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <span className="text-on-surface-variant font-label-sm text-xs flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">group</span>
                                  {friend.mutual} Mutual
                                </span>
                                {friend.activity && (
                                  <span className="text-on-surface-variant font-label-sm text-xs italic opacity-70">
                                    {friend.activity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMessageFriend(friend.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all active:scale-90"
                              title="Message"
                            >
                              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-error transition-all active:scale-90"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-[20px]">person_remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30 mb-3">
                        person_search
                      </span>
                      <p className="text-on-surface-variant">No friends found matching "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "requests" && (
                <>
                  <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold mb-2">
                    Received Requests ({requests.length})
                  </h3>
                  {requests.length > 0 ? (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-surface-container/40 backdrop-blur-sm border border-white/5 rounded-xl p-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                              alt={req.name}
                              src={req.avatar}
                            />
                            <div>
                              <h4 className="font-headline-md text-sm text-on-surface font-bold">{req.name}</h4>
                              <p className="text-on-surface-variant text-xs mt-1">Wants to connect with you</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(req)}
                              className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 text-xs transition-all active:scale-95 shadow-md shadow-primary/10"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="px-4 py-2 bg-white/10 text-on-surface-variant font-bold rounded-lg hover:bg-white/20 text-xs transition-all active:scale-95"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30 mb-3">
                        mail
                      </span>
                      <p className="text-on-surface-variant">No pending friend requests</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "sent" && (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30 mb-3">
                    send
                  </span>
                  <p className="text-on-surface-variant">No sent pending requests</p>
                </div>
              )}
            </div>

            {/* Suggestions Sidebar (Right) */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              
              {/* Suggestions */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="font-headline-md text-[20px] text-on-surface font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  Suggestions
                </h3>
                <div className="space-y-5">
                  {suggestions.map((sug) => (
                    <div key={sug.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                          alt={sug.name}
                          src={sug.avatar}
                        />
                        <div className="overflow-hidden">
                          <h5 className="font-label-md text-on-surface truncate text-sm font-semibold">{sug.name}</h5>
                          <p className="text-[11px] text-on-surface-variant truncate">{sug.detail}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(sug.id)}
                        disabled={sug.added}
                        className={`p-2 rounded-full transition-all active:scale-90 ${
                          sug.added
                            ? "bg-green-500/10 text-green-400 cursor-default"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {sug.added ? "done" : "person_add"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-primary font-label-sm text-xs border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                  Find More People
                </button>
              </div>

              {/* Pending Preview Mini-Card */}
              {requests.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 hidden lg:block">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs font-semibold">
                      Pending ({requests.length})
                    </h3>
                    <button onClick={() => setActiveTab("requests")} className="text-[12px] text-primary hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {requests.slice(0, 1).map((req) => (
                      <div key={req.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                        <img
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                          alt={req.name}
                          src={req.avatar}
                        />
                        <div className="flex-1 overflow-hidden">
                          <h5 className="font-label-sm text-on-surface truncate text-xs font-semibold">{req.name}</h5>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleAcceptRequest(req)}
                              className="px-2 py-1 bg-primary text-on-primary text-[10px] rounded-md hover:brightness-110 font-bold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="px-2 py-1 bg-white/10 text-on-surface-variant text-[10px] rounded-md hover:bg-white/20"
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

        {/* FAB */}
        <button
          onClick={() => setIsAddFriendOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 primary-gradient text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-50"
        >
          <span className="material-symbols-outlined text-[28px]">person_add</span>
        </button>

        {/* Add New Friend Popup Modal */}
        {isAddFriendOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card w-full max-w-md rounded-2xl border border-white/15 overflow-hidden shadow-2xl animate-scale-in">
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-surface-container-lowest/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                  <h3 className="font-headline-md text-sm font-bold text-white">Add New Friend</h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddFriendOpen(false);
                    setNewFriendInput("");
                    setAddFriendStatus(null);
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Send a connection request to start messaging. Enter their unique username or email address.
                </p>
                
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                    alternate_email
                  </span>
                  <input
                    value={newFriendInput}
                    onChange={(e) => setNewFriendInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/40 text-white"
                    placeholder="Enter username or email address..."
                    type="text"
                    autoFocus
                  />
                </div>

                {addFriendStatus && (
                  <div className={`p-3 rounded-lg text-[11px] font-semibold ${
                    addFriendStatus.type === "success" 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                      : "bg-error/10 border border-error/20 text-error"
                  }`}>
                    {addFriendStatus.message}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-surface-container-lowest/40 border-t border-white/5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddFriendOpen(false);
                    setNewFriendInput("");
                    setAddFriendStatus(null);
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-on-surface-variant rounded-lg text-xs font-semibold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFriendSubmit}
                  className="px-4 py-2 primary-gradient text-on-primary font-bold rounded-lg text-xs transition-all active:scale-95 shadow-md shadow-primary/10"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
