"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    typingChatId,
    selectChat,
    sendMessage,
    reactToMessage,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState(null); // Stores messageId
  const messageStreamRef = useRef(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messageStreamRef.current) {
      messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight;
    }
  }, [messages, typingChatId, activeChat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText("");
  };

  const handleSelectChat = (chat) => {
    selectChat(chat);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="h-screen flex overflow-hidden font-body-md text-body-md bg-background-app text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-sidebar-width flex h-screen overflow-hidden relative">
        {/* Page specific background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.1),transparent_40%)] pointer-events-none -z-10" />
        
        {/* Chat List Panel (Middle Column) */}
        <section
          className={`w-full md:w-80 h-full border-r border-white/5 flex flex-col bg-surface-container-lowest/30 backdrop-blur-md transition-all duration-300 ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-p-lg space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="font-headline-md text-headline-md font-bold">Messages</h2>
              </div>
              <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">
                search
              </span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
                placeholder="Search conversations..."
                type="text"
              />
            </div>

            {/* Pinned Chats */}
            {chats.some((c) => c.pinned) && (
              <div className="space-y-4">
                <p className="text-label-sm font-label-sm text-on-surface-variant opacity-50 uppercase tracking-widest">
                  Pinned Chats
                </p>
                <div className="space-y-2">
                  {chats
                    .filter((c) => c.pinned)
                    .map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                          activeChat?.id === chat.id
                            ? "bg-primary/10 border-primary/30"
                            : "bg-primary/5 border-primary/10 hover:bg-primary/10"
                        }`}
                      >
                        <div className="relative">
                          {chat.avatar ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                              alt={chat.name}
                              src={chat.avatar}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary font-bold border border-white/10">
                              {chat.initials}
                            </div>
                          )}
                          {chat.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-label-md text-label-md truncate">{chat.name}</h4>
                            <span className="text-[10px] text-primary">{chat.time}</span>
                          </div>
                          <p className="text-label-sm text-on-surface-variant truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* All Chats */}
          <div className="flex-grow overflow-y-auto custom-scrollbar px-p-lg pb-p-lg">
            <p className="text-label-sm font-label-sm text-on-surface-variant opacity-50 uppercase tracking-widest mb-4">
              All Chats
            </p>
            <div className="space-y-1">
              {chats
                .filter((c) => !c.pinned)
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                      activeChat?.id === chat.id ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative">
                      {chat.avatar ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                          alt={chat.name}
                          src={chat.avatar}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary font-bold border border-white/10">
                          {chat.initials}
                        </div>
                      )}
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-label-md text-label-md truncate">{chat.name}</h4>
                        <span className="text-[10px] text-on-surface-variant">{chat.time}</span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-on-primary ml-1">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Main Chat Window (Right Column) */}
        <section
          className={`flex-grow h-full flex flex-col relative bg-background/20 transition-all duration-300 ${
            !mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Header */}
              <header className="h-20 flex items-center justify-between px-gutter border-b border-white/5 bg-surface/30 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <div className="relative">
                    {activeChat.avatar ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        alt={activeChat.name}
                        src={activeChat.avatar}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary font-bold border border-white/10">
                        {activeChat.initials}
                      </div>
                    )}
                    {activeChat.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline-md text-base font-bold leading-tight">{activeChat.name}</h3>
                    <p className="text-label-sm font-label-sm text-primary">
                      {activeChat.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors active:scale-95">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <button className="p-3 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors active:scale-95">
                    <span className="material-symbols-outlined">videocam</span>
                  </button>
                  <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block"></div>
                  <button className="p-3 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors active:scale-95 hidden sm:block">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                  <button className="p-3 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors active:scale-95">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </header>

              {/* Message Stream */}
              <div ref={messageStreamRef} className="flex-1 overflow-y-auto custom-scrollbar p-gutter space-y-3 flex flex-col bg-background/40">
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest border border-white/5">
                    Today
                  </span>
                </div>

                {/* Spacer to push messages to bottom if there are few */}
                <div className="flex-grow" />

                {messages.map((msg, index) => {
                  const isMe = msg.senderId === "me";
                  const bubbleRoundClass = isMe
                    ? "chat-bubble-sent text-white rounded-br-none"
                    : "chat-bubble-received text-on-surface rounded-bl-none";

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex items-end gap-3 max-w-[85%] relative group ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {!isMe && activeChat.avatar && (
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                          alt={msg.senderName}
                          src={activeChat.avatar}
                        />
                      )}
                      <div className="space-y-1 relative">
                        <div className={`px-3 py-2 rounded-xl relative ${bubbleRoundClass}`}>
                          <p className="text-sm font-body-md break-words">{msg.text}</p>

                          {/* Float Reaction Bar for received bubbles */}
                          {!isMe && (
                            <div className="absolute -top-7 left-0 flex items-center gap-1 bg-surface-container-high/80 backdrop-blur-md rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-lg z-20">
                              {["❤️", "👍", "🔥", "😂"].map((emoji) => (
                                <span
                                  key={emoji}
                                  onClick={() => reactToMessage(activeChat.id, msg.id, emoji)}
                                  className="text-xs cursor-pointer hover:scale-135 transition-transform"
                                >
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Display message reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            {msg.reactions.map((r, ri) => (
                              <span
                                key={ri}
                                className="bg-white/10 border border-white/5 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-sm"
                              >
                                <span>{r.emoji}</span>
                                {r.count > 1 && <span className="opacity-60">{r.count}</span>}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end mr-1" : "ml-1"}`}>
                          <span className="text-[10px] text-on-surface-variant opacity-60">{msg.time}</span>
                          {isMe && (
                            <span className="material-symbols-outlined text-[12px] text-primary">
                              {msg.status === "read" ? "done_all" : "done"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Counterparty Typing indicator */}
                {typingChatId === activeChat.id && (
                  <div className="flex items-end gap-3 max-w-[80%]">
                    {activeChat.avatar && (
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                        alt={activeChat.name}
                        src={activeChat.avatar}
                      />
                    )}
                    <div className="chat-bubble-received px-3 py-2 rounded-xl rounded-bl-none flex gap-1 items-center h-8">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Composer */}
              <footer className="p-gutter pt-0">
                <form
                  onSubmit={handleSend}
                  className="glass-card rounded-[2rem] p-2 flex items-center gap-2 group transition-all focus-within:ring-1 focus-within:ring-primary/30"
                >
                  <div className="flex items-center px-1">
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">image</span>
                    </button>
                  </div>
                  <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-body-md py-3 placeholder:text-on-surface-variant/50 text-white outline-none"
                    placeholder="Type a message..."
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <div className="flex items-center px-1 gap-1">
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        send
                      </span>
                    </button>
                  </div>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-4">
                chat_bubble_outline
              </span>
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Select a Conversation</h3>
              <p className="text-on-surface-variant max-w-sm">
                Choose a conversation from the sidebar to start messaging. Connect beyond boundaries.
              </p>
            </div>
          )}

          {/* Background blurs decoration */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-tertiary/10 blur-[100px] pointer-events-none rounded-full"></div>
        </section>
      </main>
    </div>
  );
}
