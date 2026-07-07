"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { chatService } from "@/services/chatService";
import { SOCKET_URL } from "@/config/api";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingChatId, setTypingChatId] = useState(null);
  const socketRef = useRef(null);

  // Helper to load messages for a specific chat from the API
  const loadMessagesForChat = async (chatId) => {
    try {
      const msgs = await chatService.getMessages(chatId);
      setMessages((prev) => ({
        ...prev,
        [chatId]: msgs,
      }));
    } catch (err) {
      console.error(`Failed to load messages for chat ${chatId}:`, err);
    }
  };

  // Helper to load all chats from the API
  const loadChats = async () => {
    try {
      const fetchedChats = await chatService.getChats();
      setChats(fetchedChats);
      return fetchedChats;
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
    return [];
  };

  // Load initial chats on mount
  useEffect(() => {
    async function loadInitialData() {
      const loadedChats = await loadChats();
      if (loadedChats.length > 0) {
        setActiveChat(loadedChats[0]);
        await loadMessagesForChat(loadedChats[0].id);
      }
    }
    loadInitialData();
  }, []);

  // Sync messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      loadMessagesForChat(activeChat.id);
    }
  }, [activeChat]);

  // Connect to socket when authenticated (progressive enhancement)
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    try {
      const socket = io(SOCKET_URL, {
        auth: { token, role: user.role },
        transports: ["websocket"],
        autoConnect: false,
      });

      socket.connect();
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to NexusChat live backend websocket.");
      });

      socket.on("new_message", (data) => {
        const senderId = data.senderId || "external";
        const chatId = senderId === user.email ? "elena_vance" : senderId;
        
        // Refresh local history
        loadMessagesForChat(chatId);
        loadChats();
      });

      socket.on("connect_error", (err) => {
        console.warn("Socket connection failed. Using API routes only.");
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch (e) {
      console.warn("Failed to configure socket client.", e);
    }
  }, [token, user]);

  const appendMessage = (chatId, messageObj) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [...chatMsgs, messageObj],
      };
    });

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: messageObj.text,
              time: messageObj.time,
              unread: activeChat?.id === chatId ? 0 : c.unread,
            }
          : c
      )
    );
  };

  const sendMessage = async (text) => {
    if (!activeChat || !text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localUserMsg = {
      id: Date.now(),
      senderId: "me",
      senderName: user ? user.username : "Alex Rivera",
      text: text,
      time: timeString,
      reactions: [],
      status: "sending"
    };

    // 1. Instantly display locally for fast feedback
    appendMessage(activeChat.id, localUserMsg);

    try {
      // 2. Save to database via API
      await chatService.sendMessage(activeChat.id, text);
      
      // 3. Trigger typing simulation for the partner response (or let the socket handle it if online)
      setTypingChatId(activeChat.id);
      
      setTimeout(async () => {
        setTypingChatId(null);
        // 4. Load full message history (including response) from API
        await loadMessagesForChat(activeChat.id);
        await loadChats();
      }, 1200 + Math.random() * 800);

      // Send to Socket if connected
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("public_chat", { message: text });
      }
    } catch (err) {
      console.error("Failed to send message via API:", err);
    }
  };

  const reactToMessage = async (chatId, messageId, emoji) => {
    try {
      await chatService.reactToMessage(chatId, messageId, emoji);
      await loadMessagesForChat(chatId);
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  const markAsRead = (chatId) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))
    );
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    markAsRead(chat.id);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages: activeChat ? messages[activeChat.id] || [] : [],
        typingChatId,
        selectChat,
        sendMessage,
        reactToMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
