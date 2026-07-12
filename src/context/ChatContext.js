"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { chatService } from "@/services/chatService";
import { SOCKET_URL } from "@/config/api";

const createFakeVideoTrack = () => {
  if (typeof window === "undefined" || !document) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let angle = 0;
  const draw = () => {
    if (!ctx) return;
    
    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#0f172a"); // slate-900
    grad.addColorStop(1, "#1e1b4b"); // indigo-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Draw scanning grid lines
    ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Draw target orbit
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 240, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Draw orbiting orb
    const orbX = 320 + Math.cos((angle * Math.PI) / 180) * 100;
    const orbY = 240 + Math.sin((angle * Math.PI) / 180) * 100;
    ctx.fillStyle = "#6366f1"; // Indigo-500
    ctx.shadowColor = "#6366f1";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(orbX, orbY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Draw text overlays
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Virtual Camera", 320, 210);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "14px sans-serif";
    ctx.fillText("Multi-Tab Device Fallback", 320, 240);

    // Live blinking indicator
    const seconds = Math.floor(Date.now() / 1000);
    if (seconds % 2 === 0) {
      ctx.fillStyle = "#ef4444"; // red dot
      ctx.beginPath();
      ctx.arc(280, 275, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText("LIVE", 295, 280);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("LIVE", 320, 280);
    }

    angle = (angle + 2) % 360;
    requestAnimationFrame(draw);
  };

  draw();
  const stream = canvas.captureStream(30);
  return stream.getVideoTracks()[0] || null;
};

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChatState] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingMap, setTypingMap] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [callState, setCallState] = useState(null);

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteCandidatesQueueRef = useRef([]);

  const loadChats = useCallback(async () => {
    try {
      const [dms, groups] = await Promise.all([
        chatService.getConversations(),
        chatService.getGroups(),
      ]);
      const all = [...dms, ...groups].sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
      setChats(all);

      // Initialize onlineUsers Set with users who are already online in the loaded conversations
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        dms.forEach((chat) => {
          if (chat.online) {
            next.add(chat.otherId);
          }
        });
        return next;
      });

      // Join rooms for all chats to receive real-time updates for them
      if (socketRef.current?.connected) {
        all.forEach((chat) => {
          if (chat.type === "dm") {
            socketRef.current.emit("joinConversation", {
              conversationId: chat.conversationId,
            });
          } else {
            socketRef.current.emit("joinGroup", { groupId: chat.groupId });
          }
        });
      }

      return all;
    } catch (err) {
      console.error("Failed to load chats:", err);
      return [];
    }
  }, []);

  const loadMessages = useCallback(async (chat) => {
    try {
      let msgs = [];
      if (chat.type === "dm") {
        msgs = await chatService.getConversationMessages(chat.conversationId);
      } else if (chat.type === "group") {
        msgs = await chatService.getGroupMessages(chat.groupId);
      }
      setMessages((prev) => ({ ...prev, [chat.id]: msgs }));

      // Send delivery receipts for incoming messages
      if (socketRef.current?.connected && msgs.length > 0) {
        msgs.forEach((msg) => {
          if (msg.senderId !== user?.id) {
            const alreadyDelivered = msg.deliveries?.some((d) => d.userId === user?.id);
            if (!alreadyDelivered) {
              socketRef.current.emit("messageDelivered", { messageId: msg.id });
            }
          }
        });
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;

    async function init() {
      const all = await loadChats();

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const chatParam = params.get("chat");

        if (chatParam && all.length > 0) {
          const match = all.find(
            (c) =>
              c.id.toLowerCase().includes(chatParam.toLowerCase()) ||
              String(c.otherId) === chatParam
          );
          if (match) {
            setActiveChatState(match);
            await loadMessages(match);
            window.history.replaceState(null, "", "/dashboard");
            return;
          }
        }
      }
    }

    init();
  }, [token, loadChats, loadMessages]);

  const endCallCleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    remoteCandidatesQueueRef.current = [];
    setCallState(null);
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WS] Connected:", socket.id);

      // Join all conversation rooms on reconnect
      const currentChats = chatsRef.current || [];
      currentChats.forEach((chat) => {
        if (chat.type === "dm") {
          socket.emit("joinConversation", {
            conversationId: chat.conversationId,
          });
        } else {
          socket.emit("joinGroup", { groupId: chat.groupId });
        }
      });

      const currentActive = activeChatRef.current;
      if (currentActive) {
        if (currentActive.type === "dm") {
          socket.emit("joinConversation", {
            conversationId: currentActive.conversationId,
          });
        } else {
          socket.emit("joinGroup", { groupId: currentActive.groupId });
        }
      }
    });

    socket.on("initialOnlineUsers", (userIds) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        userIds.forEach((id) => next.add(id));
        return next;
      });
    });

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("receiveMessage", (msg) => {
      const roomId = msg.conversationId
        ? `conv_${msg.conversationId}`
        : `group_${msg.groupId}`;

      // Check if room exists in our chats list
      const currentChats = chatsRef.current || [];
      const chatExists = currentChats.some((c) => c.id === roomId);
      if (!chatExists) {
        // Conversation is not in our sidebar, reload all chats in real-time
        loadChats();
      }

      let clientMsgId = null;
      if (msg.metadata) {
        if (typeof msg.metadata === "string") {
          try {
            const parsed = JSON.parse(msg.metadata);
            clientMsgId = parsed?.clientMsgId;
          } catch (e) {}
        } else if (typeof msg.metadata === "object") {
          clientMsgId = msg.metadata.clientMsgId;
        }
      }

      setMessages((prev) => {
        const existing = prev[roomId] || [];
        if (existing.find((m) => m.id === msg.id)) return prev;

        if (clientMsgId) {
          const optIdx = existing.findIndex(
            (m) => m.id === clientMsgId || m.metadata?.clientMsgId === clientMsgId
          );
          if (optIdx !== -1) {
            const nextList = [...existing];
            nextList[optIdx] = msg;
            return { ...prev, [roomId]: nextList };
          }
        }

        return { ...prev, [roomId]: [...existing, msg] };
      });

      setChats((prev) => {
        const nextChats = prev.map((c) =>
          c.id === roomId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.sentAt }
            : c
        );
        return [...nextChats].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      // Send delivery receipts for incoming messages in real-time
      if (msg.senderId !== user?.id) {
        socket.emit("messageDelivered", { messageId: msg.id });
      }
    });

    socket.on("messageDelivered", ({ messageId, userId, deliveredAt }) => {
      setMessages((prev) => {
        const next = { ...prev };
        for (const roomId in next) {
          const idx = next[roomId].findIndex((m) => m.id === messageId);
          if (idx !== -1) {
            const list = [...next[roomId]];
            const msg = list[idx];
            const deliveries = msg.deliveries ? [...msg.deliveries] : [];
            if (!deliveries.some((d) => d.userId === userId)) {
              deliveries.push({ userId, deliveredAt });
              list[idx] = { ...msg, deliveries };
              next[roomId] = list;
            }
            break;
          }
        }
        return next;
      });
    });

    socket.on("messageRead", ({ messageId, userId, readAt }) => {
      setMessages((prev) => {
        const next = { ...prev };
        for (const roomId in next) {
          const idx = next[roomId].findIndex((m) => m.id === messageId);
          if (idx !== -1) {
            const list = [...next[roomId]];
            const msg = list[idx];
            const reads = msg.reads ? [...msg.reads] : [];
            if (!reads.some((r) => r.userId === userId)) {
              reads.push({ userId, readAt });
              list[idx] = { ...msg, reads };
              next[roomId] = list;
            }
            break;
          }
        }
        return next;
      });
    });

    socket.on("typingStart", ({ userId, conversationId, groupId }) => {
      const roomId = conversationId
        ? `conv_${conversationId}`
        : `group_${groupId}`;
      setTypingMap((prev) => ({ ...prev, [roomId]: userId }));
    });

    socket.on("typingStop", ({ userId, conversationId, groupId }) => {
      const roomId = conversationId
        ? `conv_${conversationId}`
        : `group_${groupId}`;
      setTypingMap((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    });

    socket.on("incoming_call", async ({ fromUserId, offer, callType }) => {
      setChats((prevChats) => {
        const caller = prevChats.find((c) => c.otherId === fromUserId);
        setCallState({
          type: "incoming",
          callType,
          fromUserId,
          fromName: caller?.name || `User ${fromUserId}`,
          fromAvatar: caller?.avatar || null,
          offer,
        });
        return prevChats;
      });
    });

    const processIceQueue = async (pc) => {
      if (pc && remoteCandidatesQueueRef.current.length > 0) {
        for (const candidate of remoteCandidatesQueueRef.current) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.warn("Failed to add queued ICE candidate", e);
          }
        }
        remoteCandidatesQueueRef.current = [];
      }
    };

    socket.on("call_answered", async ({ answer }) => {
      if (peerConnectionRef.current) {
        if (peerConnectionRef.current.signalingState !== "stable") {
          try {
            await peerConnectionRef.current.setRemoteDescription(answer);
            await processIceQueue(peerConnectionRef.current);
          } catch (err) {
            console.error("Failed to set remote description on call answered:", err);
          }
        }
      }
      setCallState((prev) => (prev ? { ...prev, type: "active" } : null));
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      if (candidate) {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.warn("Failed to add ICE candidate direct", e);
          }
        } else {
          remoteCandidatesQueueRef.current.push(candidate);
        }
      }
    });

    socket.on("call_ended", () => {
      endCallCleanup();
    });

    socket.on("call_rejected", () => {
      endCallCleanup();
    });

    socket.on("connect_error", (err) => {
      console.warn("[WS] Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, endCallCleanup]);

  // Automatically join WebSocket room when activeChat changes or when socket connects
  useEffect(() => {
    if (socketRef.current?.connected && activeChat) {
      if (activeChat.type === "dm") {
        socketRef.current.emit("joinConversation", {
          conversationId: activeChat.conversationId,
        });
      } else {
        socketRef.current.emit("joinGroup", { groupId: activeChat.groupId });
      }
    }
  }, [activeChat, socketRef.current?.connected]);

  // Track page path and send read receipts only when active on dashboard
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard" && activeChat && socketRef.current?.connected && user?.id) {
      const activeRoomId = activeChat.id;
      const msgs = messages[activeRoomId] || [];
      msgs.forEach((msg) => {
        if (msg.senderId !== user?.id) {
          const alreadyRead = msg.reads?.some((r) => r.userId === user?.id);
          if (!alreadyRead) {
            socketRef.current.emit("messageRead", { messageId: msg.id });
          }
        }
      });
    }
  }, [pathname, activeChat, messages, user, socketRef.current?.connected]);

  const selectChat = useCallback(
    async (chat) => {
      setActiveChatState(chat);
      if (!messages[chat.id]) {
        await loadMessages(chat);
      } else {
        // If messages are already in state, send delivery receipts if needed
        const msgs = messages[chat.id] || [];
        if (socketRef.current?.connected && msgs.length > 0) {
          msgs.forEach((msg) => {
            if (msg.senderId !== user?.id) {
              const alreadyDelivered = msg.deliveries?.some((d) => d.userId === user?.id);
              if (!alreadyDelivered) {
                socketRef.current.emit("messageDelivered", { messageId: msg.id });
              }
            }
          });
        }
      }
      if (socketRef.current?.connected) {
        if (chat.type === "dm") {
          socketRef.current.emit("joinConversation", {
            conversationId: chat.conversationId,
          });
        } else {
          socketRef.current.emit("joinGroup", { groupId: chat.groupId });
        }
      }
    },
    [messages, loadMessages, user]
  );

  const startConversation = useCallback(
    async (otherUserId) => {
      try {
        const conv = await chatService.createConversation(otherUserId);
        const all = await loadChats();
        const match =
          all.find((c) => c.conversationId === conv?.id) || {
            id: `conv_${conv?.id}`,
            conversationId: conv?.id,
            type: "dm",
            name: `User ${otherUserId}`,
            avatar: null,
          };
        await selectChat(match);
        return match;
      } catch (err) {
        console.error("Failed to start conversation:", err);
      }
    },
    [loadChats, selectChat]
  );

  const getOrCreateChat = useCallback(
    async (idOrUsername, name, avatar) => {
      const key = String(idOrUsername).toLowerCase();
      const existing = chats.find(
        (c) =>
          c.type === "dm" &&
          (String(c.otherId) === String(idOrUsername) ||
            c.id.toLowerCase().includes(key) ||
            c.name?.toLowerCase() === String(name || idOrUsername).toLowerCase())
      );

      if (existing) {
        await selectChat(existing);
        return existing;
      }

      const created = await startConversation(idOrUsername);
      if (created && (name || avatar)) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === created.id ? { ...c, name: name || c.name, avatar: avatar ?? c.avatar } : c
          )
        );
        setActiveChatState((prev) =>
          prev?.id === created.id
            ? { ...prev, name: name || prev.name, avatar: avatar ?? prev.avatar }
            : prev
        );
      }
      return created;
    },
    [chats, selectChat, startConversation]
  );

  const createGroup = useCallback(
    async (name, memberIds, avatar) => {
      try {
        await chatService.createGroup(name, memberIds, avatar);
        await loadChats();
      } catch (err) {
        console.error("Failed to create group:", err);
      }
    },
    [loadChats]
  );

  const sendMessage = useCallback(
    async (content) => {
      if (!activeChat || !content.trim() || !socketRef.current?.connected) return;

      const roomId = activeChat.id;
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sentTime = new Date().toISOString();

      // Create optimistic message
      const tempMsg = {
        id: tempId,
        senderId: user?.id,
        content,
        sentAt: sentTime,
        sender: {
          id: user?.id,
          username: user?.username || user?.email?.split("@")[0] || "Me",
          email: user?.email,
          avatar: user?.avatar,
        },
        reads: [],
        deliveries: [],
        reactions: [],
        isSending: true,
        metadata: { clientMsgId: tempId },
      };

      // Immediately append message locally
      setMessages((prev) => {
        const existing = prev[roomId] || [];
        if (existing.some((m) => m.id === tempId)) return prev;
        return { ...prev, [roomId]: [...existing, tempMsg] };
      });

      // Update sidebar chat optimistically
      setChats((prev) => {
        const nextChats = prev.map((c) =>
          c.id === roomId
            ? { ...c, lastMessage: content, lastMessageAt: sentTime }
            : c
        );
        return [...nextChats].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      // Timeout helper to mark as failed if not confirmed in 8s
      setTimeout(() => {
        setMessages((prev) => {
          const existing = prev[roomId] || [];
          const idx = existing.findIndex((m) => m.id === tempId);
          if (idx !== -1 && existing[idx].isSending) {
            const nextList = [...existing];
            nextList[idx] = { ...nextList[idx], isSending: false, isFailed: true };
            return { ...prev, [roomId]: nextList };
          }
          return prev;
        });
      }, 8000);

      // Socket payload with metadata clientMsgId
      const payload = {
        content,
        metadata: { clientMsgId: tempId },
      };

      if (activeChat.type === "dm") {
        payload.conversationId = activeChat.conversationId;
      } else {
        payload.groupId = activeChat.groupId;
      }

      socketRef.current.emit("sendMessage", payload);
    },
    [activeChat, user]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!activeChat || !socketRef.current?.connected) return;
      const eventName = isTyping ? "typingStart" : "typingStop";
      socketRef.current.emit(eventName, {
        conversationId:
          activeChat.type === "dm" ? activeChat.conversationId : undefined,
        groupId: activeChat.type === "group" ? activeChat.groupId : undefined,
      });
    },
    [activeChat]
  );

  const createPeerConnection = (targetUserId) => {
    remoteCandidatesQueueRef.current = [];
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice_candidate", {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      setCallState((prev) =>
        prev ? { ...prev, remoteStream: event.streams[0] } : null
      );
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = useCallback(
    async (targetUserId, callType = "video") => {
      let stream;
      let actualCallType = callType;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video",
          audio: true,
        });
      } catch (err) {
        console.warn("Failed to access video/audio. Trying audio-only + virtual video fallback...", err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          const tracks = [...audioStream.getAudioTracks()];
          if (callType === "video") {
            const fakeVideoTrack = createFakeVideoTrack();
            if (fakeVideoTrack) {
              tracks.push(fakeVideoTrack);
            }
          }
          stream = new MediaStream(tracks);
        } catch (err2) {
          console.warn("Failed to acquire microphone, attempting virtual video only...", err2);
          if (callType === "video") {
            const fakeVideoTrack = createFakeVideoTrack();
            if (fakeVideoTrack) {
              stream = new MediaStream([fakeVideoTrack]);
            }
          }
          if (!stream) {
            console.error("Failed to acquire any media devices:", err2);
            alert("Could not access camera or microphone. Please check permissions.");
            return;
          }
        }
      }

      try {
        localStreamRef.current = stream;
        const targetChat = chats.find((c) => c.otherId === targetUserId);
        const pc = createPeerConnection(targetUserId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("call_offer", { targetUserId, offer, callType: actualCallType });
        setCallState({
          type: "outgoing",
          callType: actualCallType,
          fromUserId: targetUserId,
          fromName: targetChat?.name || `User ${targetUserId}`,
          fromAvatar: targetChat?.avatar || null,
          localStream: stream,
        });
      } catch (err) {
        console.error("Failed to initiate WebRTC call:", err);
      }
    },
    [chats]
  );

  const acceptCall = useCallback(async () => {
    if (!callState?.offer) return;
    let stream;
    let actualCallType = callState.callType;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: callState.callType === "video",
        audio: true,
      });
    } catch (err) {
      console.warn("Failed to accept call with video/audio, trying audio + virtual video fallback...", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        const tracks = [...audioStream.getAudioTracks()];
        if (callState.callType === "video") {
          const fakeVideoTrack = createFakeVideoTrack();
          if (fakeVideoTrack) {
            tracks.push(fakeVideoTrack);
          }
        }
        stream = new MediaStream(tracks);
      } catch (err2) {
        console.warn("Failed to acquire microphone on accept, trying virtual video only...", err2);
        if (callState.callType === "video") {
          const fakeVideoTrack = createFakeVideoTrack();
          if (fakeVideoTrack) {
            stream = new MediaStream([fakeVideoTrack]);
          }
        }
        if (!stream) {
          console.error("Failed to accept call even with fallback:", err2);
          alert("Could not access camera or microphone. Please check device permissions.");
          return;
        }
      }
    }

    try {
      localStreamRef.current = stream;
      const pc = createPeerConnection(callState.fromUserId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(callState.offer);

      // Process any ICE candidates that arrived before the remote description was set
      if (remoteCandidatesQueueRef.current.length > 0) {
        for (const candidate of remoteCandidatesQueueRef.current) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.warn("Failed to add queued ICE candidate in acceptCall", e);
          }
        }
        remoteCandidatesQueueRef.current = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("call_answer", {
        targetUserId: callState.fromUserId,
        answer,
      });
      setCallState((prev) => ({
        ...prev,
        type: "active",
        callType: actualCallType,
        localStream: stream,
      }));
    } catch (err) {
      console.error("Failed to accept call WebRTC handshake:", err);
    }
  }, [callState]);

  const rejectCall = useCallback(() => {
    if (callState?.fromUserId) {
      socketRef.current?.emit("call_rejected", {
        targetUserId: callState.fromUserId,
      });
    }
    endCallCleanup();
  }, [callState, endCallCleanup]);

  const endCall = useCallback(() => {
    if (callState?.fromUserId) {
      socketRef.current?.emit("call_ended", {
        targetUserId: callState.fromUserId,
      });
    }
    endCallCleanup();
  }, [callState, endCallCleanup]);

  // Handle calling ringtones
  useEffect(() => {
    const ringtone = getRingtone();
    if (!ringtone) return;

    if (callState?.type === "outgoing") {
      ringtone.startOutgoing();
    } else if (callState?.type === "incoming") {
      ringtone.startIncoming();
    } else {
      ringtone.stop();
    }

    return () => {
      ringtone.stop();
    };
  }, [callState?.type]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages: activeChat ? messages[activeChat.id] || [] : [],
        typingMap,
        onlineUsers,
        selectChat,
        sendMessage,
        sendTyping,
        loadChats,
        startConversation,
        getOrCreateChat,
        createGroup,
        callState,
        localStreamRef,
        remoteStreamRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        socket: socketRef.current,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

class Ringtone {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.activeOscillators = [];
  }

  startOutgoing() {
    this.stop();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.audioCtx = new AudioCtx();
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.connect(this.audioCtx.destination);

      const playCycle = () => {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc2.start(now);

        // Fade-in/out the ring
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now + 1.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);

        this.activeOscillators.push(osc1, osc2);

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch (e) {}
          this.activeOscillators = this.activeOscillators.filter(o => o !== osc1 && o !== osc2);
        }, 2000);
      };

      playCycle();
      this.intervalId = setInterval(playCycle, 4000);
    } catch (err) {
      console.warn("Failed to play outgoing ringtone:", err);
    }
  }

  startIncoming() {
    this.stop();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.audioCtx = new AudioCtx();
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gainNode.connect(this.audioCtx.destination);

      const playCycle = () => {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        // Melodious sequence: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1047Hz)
        const melody = [523.25, 659.25, 783.99, 1046.50];
        
        melody.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq;

          const noteGain = this.audioCtx.createGain();
          noteGain.gain.setValueAtTime(0, now + idx * 0.15);
          noteGain.gain.linearRampToValueAtTime(0.1, now + idx * 0.15 + 0.02);
          noteGain.gain.setValueAtTime(0.1, now + idx * 0.15 + 0.12);
          noteGain.gain.linearRampToValueAtTime(0, now + idx * 0.15 + 0.14);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.2);
          this.activeOscillators.push(osc);

          setTimeout(() => {
            this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
          }, 500);
        });
      };

      playCycle();
      this.intervalId = setInterval(playCycle, 1500);
    } catch (err) {
      console.warn("Failed to play incoming ringtone:", err);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
    if (this.audioCtx) {
      try {
        if (this.audioCtx.state !== "closed") {
          this.audioCtx.close();
        }
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

let ringtoneInstance = null;
const getRingtone = () => {
  if (typeof window === "undefined") return null;
  if (!ringtoneInstance) {
    ringtoneInstance = new Ringtone();
  }
  return ringtoneInstance;
};
