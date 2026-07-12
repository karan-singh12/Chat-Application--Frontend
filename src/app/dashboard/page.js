"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { authService } from "@/services/authService";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    typingMap,
    onlineUsers,
    selectChat,
    sendMessage,
    sendTyping,
    startConversation,
    createGroup,
    callState,
    localStreamRef,
    remoteStreamRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageStreamRef = useRef(null);
  const typingTimerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageStreamRef.current) {
      messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight;
    }
  }, [messages, typingMap, activeChat]);

  // Attach streams to video elements when call is active
  useEffect(() => {
    if (callState?.type === "active") {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    }
  }, [callState, localStreamRef, remoteStreamRef]);

  // Load friends for modals
  useEffect(() => {
    authService.getFriendsList().then((res) => {
      if (res.success && res.data) {
        setFriends(
          res.data.map((item) => ({
            id: item.id,
            name: item.username || item.email.split("@")[0],
            avatar: item.avatar || null,
          }))
        );
      }
    }).catch(() => {});
  }, []);
 
  // Auto-select first chat on desktop layout
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768 && !activeChat && chats.length > 0) {
      selectChat(chats[0]);
    }
  }, [chats, activeChat, selectChat]);

  // Typing indicator â€“ debounced
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText("");
    setIsTyping(false);
    sendTyping(false);
    clearTimeout(typingTimerRef.current);
  };

  const handleSelectChat = (chat) => {
    selectChat(chat);
    setMobileShowChat(true);
  };

  const handleStartChat = async (friend) => {
    setIsNewChatOpen(false);
    await startConversation(friend.id);
    setMobileShowChat(true);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    await createGroup(groupName.trim(), selectedGroupMembers.map((f) => f.id));
    setIsNewGroupOpen(false);
    setGroupName("");
    setSelectedGroupMembers([]);
  };

  const toggleGroupMember = (friend) => {
    setSelectedGroupMembers((prev) =>
      prev.find((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const isOnline = (chat) => onlineUsers.has(chat.otherId);
  const isTypingInChat = (chat) => !!typingMap[chat.id];

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "??";

  const filteredChats = chats.filter((c) =>
    c.name?.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const activeRoomId = activeChat?.id;
  const isActiveChatTyping = activeRoomId && !!typingMap[activeRoomId];

  return (
    <div className="h-screen flex overflow-hidden font-body-md text-body-md bg-background-app text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} hideMobileNav={mobileShowChat && !!activeChat} />

      {/* Main Content Area */}
      <main className={`flex-1 md:ml-sidebar-width flex h-screen overflow-hidden relative pb-16 md:pb-0 ${mobileShowChat && activeChat ? "pt-0" : "pt-14 md:pt-0"}`}>
        {/* Ambient glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none -z-10" />

        {/* â”€â”€â”€ Chat List Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          className={`w-full md:w-[310px] h-full flex flex-col bg-surface-container-low/20 transition-all duration-300 ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="pt-6 px-4 pb-3 flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-on-surface-variant font-bold mt-0.5">
                  {chats.length} conversations
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* New Group */}
                <button
                  onClick={() => setIsNewGroupOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/5 text-on-surface-variant flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  title="New Group"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                </button>
                {/* New DM */}
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95 cursor-pointer"
                  title="New Chat"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                search
              </span>
              <input
                className="w-full bg-surface-container-high/60 border border-white/5 rounded-full py-2 pl-9 pr-4 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Search conversations..."
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant/40 text-xs text-center gap-2">
                <span className="material-symbols-outlined text-[32px]">chat_bubble_outline</span>
                {chatSearch ? "No conversations found" : "No conversations yet. Start chatting!"}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = activeChat?.id === chat.id;
                const online = isOnline(chat);
                const typing = isTypingInChat(chat);
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-primary border-primary/15 shadow-md shadow-primary/10"
                        : "bg-surface-container/30 border-white/5 hover:bg-surface-container-high/40 hover:translate-y-[-0.5px]"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {chat.avatar ? (
                        <img
                          className={`w-9 h-9 rounded-full object-cover border ${isActive ? "border-white/20" : "border-white/10"}`}
                          alt={chat.name}
                          src={chat.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isActive
                              ? "bg-white/20 text-white border-white/20"
                              : chat.type === "group"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/20"
                              : "bg-primary-container/30 text-primary border-white/10"
                          }`}
                        >
                          {chat.type === "group" ? (
                            <span className="material-symbols-outlined text-[16px]">group</span>
                          ) : (
                            getInitials(chat.name)
                          )}
                        </div>
                      )}
                      {online && chat.type === "dm" && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background-app rounded-full" />
                      )}
                      {chat.type === "group" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-500 rounded-full border border-background-app flex items-center justify-center">
                          <span className="material-symbols-outlined text-[8px] text-white">group</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold truncate text-white">{chat.name}</h4>
                        <span className={`text-[9px] shrink-0 ml-1 ${isActive ? "text-white/70" : "text-on-surface-variant"}`}>
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isActive ? "text-white/80" : "text-on-surface-variant"}`}>
                        {typing ? (
                          <span className="italic text-primary animate-pulse">typing...</span>
                        ) : (
                          chat.lastMessage || <span className="italic opacity-50">No messages yet</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* â”€â”€â”€ Chat Window â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          className={`flex-grow h-full flex flex-col relative border-l border-white/5 transition-all duration-300 ${
            !mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {activeChat ? (
            <div className="flex-grow flex flex-col h-full bg-transparent overflow-hidden relative">

              {/* Chat Header */}
              <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-surface-container-low/40 backdrop-blur-md z-10 select-none">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-full hover:bg-white/5 text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <Link
                    href={activeChat.type === "dm" ? `/profile/${activeChat.name}` : "#"}
                    className="flex items-center gap-3 hover:opacity-85 transition-all"
                  >
                    <div className="relative flex-shrink-0">
                      {activeChat.avatar ? (
                        <img
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                          alt={activeChat.name}
                          src={activeChat.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 ${
                          activeChat.type === "group" ? "bg-purple-500/20 text-purple-300" : "bg-primary-container/20 text-primary"
                        }`}>
                          {activeChat.type === "group" ? (
                            <span className="material-symbols-outlined text-[18px]">group</span>
                          ) : (
                            getInitials(activeChat.name)
                          )}
                        </div>
                      )}
                      {isOnline(activeChat) && activeChat.type === "dm" && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background-app rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight text-white">{activeChat.name}</h3>
                      <p className="text-[10px] font-semibold text-primary mt-0.5">
                        {activeChat.type === "group"
                          ? `${activeChat.memberCount || "?"} members`
                          : isOnline(activeChat)
                          ? "Online"
                          : "Offline"}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Call + Action Buttons */}
                <div className="flex items-center gap-0.5">
                  {activeChat.type === "dm" && (
                    <>
                      <button
                        onClick={() => startCall(activeChat.otherId, "audio")}
                        className="w-8 h-8 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                        title="Audio Call"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </button>
                      <button
                        onClick={() => startCall(activeChat.otherId, "video")}
                        className="w-8 h-8 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                        title="Video Call"
                      >
                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                      </button>
                    </>
                  )}
                  <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />
                  <button className="w-8 h-8 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer hidden sm:block">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </button>
                  <button className="w-8 h-8 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </header>

              {/* Message Stream */}
              <div
                ref={messageStreamRef}
                className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-3 flex flex-col bg-surface-container-lowest/5"
              >
                <div className="flex justify-center my-1">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-wider border border-white/5">
                    Today
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const isMe =
                    msg.isOwn ||
                    msg.senderId === user?.id ||
                    msg.sender?.id === user?.id ||
                    (msg.sender?.username && msg.sender?.username === user?.username);

                  const senderName =
                    msg.senderName ||
                    msg.sender?.username ||
                    msg.sender?.email?.split("@")[0] ||
                    "Unknown";
                  const senderAvatar = msg.senderAvatar || msg.sender?.avatar || null;

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex items-end gap-2.5 max-w-[85%] relative group ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {!isMe && (senderAvatar || activeChat.avatar) && (
                        <img
                          className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                          alt={senderName}
                          src={activeChat.type === "group" ? (senderAvatar || activeChat.avatar) : activeChat.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      )}
                      {!isMe && !(senderAvatar || activeChat.avatar) && (
                        <div className="w-7 h-7 rounded-full bg-primary-container/30 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0 border border-white/10">
                          {getInitials(senderName)}
                        </div>
                      )}
                      <div className="space-y-0.5 relative">
                        {/* Group: show sender name */}
                        {activeChat.type === "group" && !isMe && (
                          <p className="text-[10px] font-semibold text-primary ml-1 mb-0.5">{senderName}</p>
                        )}
                        <div
                          className={`px-3.5 py-2.5 rounded-[16px] relative text-xs break-all whitespace-pre-wrap leading-relaxed transition-all duration-200 ${
                            isMe
                              ? msg.isFailed
                                ? "bg-red-500/20 border border-red-500/30 text-red-200 rounded-br-sm"
                                : "bg-primary text-white rounded-br-sm shadow-sm"
                              : "bg-surface-variant text-on-surface rounded-bl-sm border border-white/5"
                          } ${msg.isSending ? "opacity-60 scale-[0.98] select-none pointer-events-none" : ""}`}
                        >
                          <p className="break-all whitespace-pre-wrap">{msg.content || msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end mr-0.5" : "ml-0.5"}`}>
                          <span className="text-[8px] text-on-surface-variant/50 font-semibold">
                            {msg.sentAt
                              ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : msg.time || ""}
                          </span>
                          {isMe && (() => {
                            if (msg.isSending) {
                              return (
                                <span className="material-symbols-outlined text-[10px] text-on-surface-variant/40 animate-spin" title="Sending...">
                                  progress_activity
                                </span>
                              );
                            }
                            if (msg.isFailed) {
                              return (
                                <span className="material-symbols-outlined text-[12px] text-red-400 font-bold" title="Failed to send">
                                  error
                                </span>
                              );
                            }

                            const isRead = msg.reads && msg.reads.some((r) => r.userId !== user?.id);
                            const isDelivered = msg.deliveries && msg.deliveries.some((d) => d.userId !== user?.id);

                            if (isRead) {
                              return (
                                <span className="material-symbols-outlined text-[11px] text-blue-400 font-bold" title="Read">
                                  done_all
                                </span>
                              );
                            } else if (isDelivered) {
                              return (
                                <span className="material-symbols-outlined text-[11px] text-on-surface-variant/40" title="Delivered">
                                  done_all
                                </span>
                              );
                            } else {
                              return (
                                <span className="material-symbols-outlined text-[11px] text-on-surface-variant/40" title="Sent">
                                  done
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isActiveChatTyping && (
                  <div className="flex items-end gap-2.5 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full bg-primary-container/30 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0 border border-white/10">
                      {getInitials(activeChat.name)}
                    </div>
                    <div className="bg-surface-variant border border-white/5 px-3 py-2 rounded-[16px] rounded-bl-sm flex gap-1 items-center h-8">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-bounce [animation-delay:0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <footer className="p-3 bg-surface-container-lowest/15 border-t border-white/5 select-none">
                <form
                  onSubmit={handleSend}
                  className="bg-surface-container-high/40 border border-white/5 rounded-full p-1.5 flex items-center gap-1.5 group transition-all focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-surface-container-high/60"
                >
                  <div className="flex items-center">
                    <button type="button" className="w-7.5 h-7.5 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    </button>
                  </div>
                  <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-1.5 px-0.5 placeholder:text-on-surface-variant/45 text-white outline-none"
                    placeholder="Send a message..."
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-7.5 h-7.5 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">mood</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="w-7.5 h-7.5 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 hover:scale-103 active:scale-97 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[16px] translate-x-[0.5px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        send
                      </span>
                    </button>
                  </div>
                </form>
              </footer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-surface-container-lowest/5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high/40 border border-white/5 flex items-center justify-center text-on-surface-variant/20 mb-4.5">
                <span className="material-symbols-outlined text-[26px]">chat_bubble</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">Select a conversation</h3>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Choose a chat from the sidebar or start a new one with a friend.
              </p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="mt-5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95"
              >
                Start new chat
              </button>
            </div>
          )}

          {/* Floating decorations */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-tertiary/5 blur-[120px] pointer-events-none rounded-full" />
        </section>
      </main>

      {/* â”€â”€â”€ Incoming Call Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {callState?.type === "incoming" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-container border border-white/10 rounded-3xl p-8 w-80 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
              {callState.fromAvatar ? (
                <img
                  src={callState.fromAvatar}
                  className="w-full h-full rounded-full object-cover"
                  alt="caller"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-primary">person</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mb-1">Incoming {callState.callType} call</p>
            <h3 className="text-lg font-bold text-white mb-6">{callState.fromName}</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={rejectCall}
                className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[28px]">call_end</span>
              </button>
              <button
                onClick={acceptCall}
                className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[28px]">call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Outgoing Call Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {callState?.type === "outgoing" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-container border border-white/10 rounded-3xl p-8 w-80 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px] text-primary animate-pulse">
                {callState.callType === "video" ? "videocam" : "call"}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-1">Calling...</p>
            <h3 className="text-lg font-bold text-white mb-6">{callState.fromName}</h3>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg mx-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[28px]">call_end</span>
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Active Call Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {callState?.type === "active" && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Remote video */}
          <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
            {(() => {
              const hasRemoteVideo =
                callState.remoteStream &&
                typeof callState.remoteStream.getVideoTracks === "function" &&
                callState.remoteStream.getVideoTracks().length > 0;

              return hasRemoteVideo ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] text-primary">person</span>
                  </div>
                  <h3 className="text-xl font-bold">{callState.fromName}</h3>
                  <p className="text-sm text-white/60">Call connected</p>
                </div>
              );
            })()}
            {/* PiP local video */}
            {(() => {
              const hasLocalVideo =
                callState.localStream &&
                typeof callState.localStream.getVideoTracks === "function" &&
                callState.localStream.getVideoTracks().length > 0;

              return hasLocalVideo ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-4 right-4 w-28 h-20 rounded-xl object-cover border-2 border-white/20 shadow-xl"
                />
              ) : null;
            })()}
          </div>
          {/* Controls */}
          <div className="h-24 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-6">
            <button className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[22px]">mic_off</span>
            </button>
            {callState.callType === "video" && (
              <button className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">videocam_off</span>
              </button>
            )}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-[28px]">call_end</span>
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ New Chat Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isNewChatOpen && (
        <div className="fixed inset-0 bg-background-app/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-white/10 rounded-[24px] w-full max-w-[400px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-white/5">
              <h2 className="text-sm font-bold text-white">New Conversation</h2>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 pb-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                <input
                  className="w-full bg-surface-container-high border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Search friends..."
                  type="text"
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 pt-1 space-y-1.5 custom-scrollbar min-h-[200px]">
              {friends.filter((f) => f.name.toLowerCase().includes(friendSearchQuery.toLowerCase())).length > 0 ? (
                friends
                  .filter((f) => f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()))
                  .map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => handleStartChat(friend)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all"
                    >
                      {friend.avatar ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                          alt={friend.name}
                          src={friend.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center text-primary text-xs font-bold border border-white/10">
                          {getInitials(friend.name)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-white">{friend.name}</span>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-[32px] mb-2">person_off</span>
                  <p className="text-xs">No friends found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ New Group Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isNewGroupOpen && (
        <div className="fixed inset-0 bg-background-app/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-white/10 rounded-[24px] w-full max-w-[420px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-white/5">
              <h2 className="text-sm font-bold text-white">Create Group</h2>
              <button
                onClick={() => { setIsNewGroupOpen(false); setGroupName(""); setSelectedGroupMembers([]); }}
                className="w-7 h-7 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Group name */}
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Group Name</label>
                <input
                  className="w-full bg-surface-container-high border border-white/5 rounded-xl py-2 px-3 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="e.g. Team Alpha"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              {/* Selected members badges */}
              {selectedGroupMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedGroupMembers.map((m) => (
                    <span key={m.id} className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded-full border border-primary/30">
                      {m.name}
                      <button onClick={() => toggleGroupMember(m)} className="hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Friend list */}
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Add Members</label>
                <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {friends.map((friend) => {
                    const selected = selectedGroupMembers.find((f) => f.id === friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => toggleGroupMember(friend)}
                        className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                          selected ? "bg-primary/10 border-primary/30" : "border-transparent hover:bg-white/5 hover:border-white/5"
                        }`}
                      >
                        {friend.avatar ? (
                          <img
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                            alt={friend.name}
                            src={friend.avatar}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary-container/30 flex items-center justify-center text-primary text-[9px] font-bold border border-white/10">
                            {getInitials(friend.name)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white flex-1">{friend.name}</span>
                        {selected && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                className="w-full py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Group ({selectedGroupMembers.length} members)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

