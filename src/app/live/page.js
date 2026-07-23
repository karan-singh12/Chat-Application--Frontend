"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { getAvatarUrl } from "@/utils/avatar";

export default function LiveStreamsPage() {
  const { user } = useAuth();
  const {
    activeLiveStreams = [],
    currentLiveStream,
    startLiveStream,
    stopLiveStream,
    joinLiveStream,
    leaveLiveStream,
  } = useChat() || {};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDuration, setStreamDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Track stream duration when active
  useEffect(() => {
    if (currentLiveStream) {
      setStreamDuration(0);
      timerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStreamDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentLiveStream]);

  // Bind video element srcObject
  useEffect(() => {
    if (videoRef.current) {
      if (currentLiveStream?.isBroadcaster && currentLiveStream.localStream) {
        videoRef.current.srcObject = currentLiveStream.localStream;
      } else if (!currentLiveStream?.isBroadcaster && currentLiveStream?.remoteStream) {
        videoRef.current.srcObject = currentLiveStream.remoteStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [currentLiveStream, currentLiveStream?.localStream, currentLiveStream?.remoteStream]);

  const handleStartBroadcast = (e) => {
    e.preventDefault();
    if (!startLiveStream) return;
    
    startLiveStream(streamTitle.trim() || `${user?.username || "User"}'s Broadcast`);
    setIsStartDialogOpen(false);
    setStreamTitle("");
  };

  const handleEndBroadcast = () => {
    if (stopLiveStream) {
      stopLiveStream();
    }
  };

  const handleLeaveStream = () => {
    if (leaveLiveStream && currentLiveStream) {
      leaveLiveStream(currentLiveStream.broadcasterId);
    }
  };

  const toggleMute = () => {
    if (currentLiveStream?.localStream) {
      const audioTracks = currentLiveStream.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (currentLiveStream?.localStream) {
      const videoTracks = currentLiveStream.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Neon Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(236,72,153,0.04),transparent_50%)] pointer-events-none -z-10" />

        <div className="p-4 flex-grow flex flex-col max-w-[1200px] mx-auto w-full">
          
          {/* STATE 1: BROWSE ACTIVE STREAMS */}
          {!currentLiveStream && (
            <div className="flex-grow flex flex-col gap-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">sensors</span>
                    Live Streams
                  </h1>
                  <p className="text-[11px] text-on-surface-variant font-bold mt-0.5">
                    Watch and interact with ongoing broadcasts, or start your own.
                  </p>
                </div>

                <button
                  onClick={() => setIsStartDialogOpen(true)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container hover:text-primary-fixed text-white font-bold rounded-full text-xs transition-all active:scale-97 cursor-pointer border border-primary/20 shadow-[0_0_15px_rgba(77,94,247,0.3)] hover:shadow-[0_0_20px_rgba(77,94,247,0.5)] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">videocam</span>
                  Go Live
                </button>
              </div>

              {/* Streams Grid */}
              <div className="flex-grow mt-2">
                {activeLiveStreams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeLiveStreams.map((stream) => (
                      <div
                        key={stream.broadcasterId}
                        className="group bg-surface-container/30 border border-white/5 hover:bg-surface-container-high/45 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 relative hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                      >
                        {/* Overlay Live Badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-red-500/20">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          LIVE
                        </div>

                        {/* Stream Thumbnail Mockup */}
                        <div className="h-44 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 flex items-center justify-center border-b border-white/5 relative group-hover:from-indigo-900/90 group-hover:to-purple-900/90 transition-colors">
                          <span className="material-symbols-outlined text-[64px] text-white/10 group-hover:scale-110 transition-transform duration-300">
                            sensors
                          </span>
                        </div>

                        {/* Info Section */}
                        <div className="p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                              src={getAvatarUrl(stream.avatar)}
                              alt={stream.username}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                            <div className="min-w-0 flex-grow">
                              <h3 className="text-xs font-bold text-white truncate">{stream.title}</h3>
                              <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">
                                @{stream.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                            <span className="text-[10px] font-semibold text-on-surface-variant/80 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">group</span>
                              {stream.viewers?.length || 0} watching
                            </span>

                            <button
                              onClick={() => joinLiveStream && joinLiveStream(stream.broadcasterId)}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/5 hover:border-primary/20 text-on-surface font-bold rounded-full text-[10px] transition-all cursor-pointer"
                            >
                              Watch Stream
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-container/10 p-16 text-center rounded-2xl border border-white/5 select-none max-w-lg mx-auto mt-12 backdrop-blur-md">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high/40 border border-white/5 flex items-center justify-center text-on-surface-variant/20 mx-auto mb-5 shadow-lg">
                      <span className="material-symbols-outlined text-[32px] text-primary">sensors_off</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">No Live Streams</h3>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mb-6">
                      Nobody is broadcasting right now. Be the first to start a live stream and share your camera with other online users!
                    </p>
                    <button
                      onClick={() => setIsStartDialogOpen(true)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-full text-xs transition-all active:scale-97 cursor-pointer"
                    >
                      Go Live Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE 2: BROADCASTER VIEW */}
          {currentLiveStream && currentLiveStream.isBroadcaster && (
            <div className="flex-grow flex flex-col lg:flex-row gap-6 pt-6 h-full">
              {/* Stream Screen */}
              <div className="flex-grow flex flex-col bg-surface-container-lowest/40 rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl">
                
                {/* Overlay Header */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/30">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                      LIVE
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {formatDuration(streamDuration)}
                    </span>
                  </div>

                  <span className="bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-auto">
                    <span className="material-symbols-outlined text-[13px]">group</span>
                    {currentLiveStream.viewerCount || 0} Viewers
                  </span>
                </div>

                {/* Video Component */}
                <div className="flex-grow h-[450px] relative bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-surface-container/90 flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[32px]">videocam_off</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-bold">Your camera is turned off</p>
                    </div>
                  )}
                </div>

                {/* Floating Bottom Stream Toolbar */}
                <div className="p-4 bg-surface-container-low/80 backdrop-blur-md border-t border-white/5 flex items-center justify-between z-20 gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                        isMuted
                          ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/35"
                          : "bg-white/5 hover:bg-white/10 text-on-surface border-white/5"
                      }`}
                      title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isMuted ? "mic_off" : "mic"}
                      </span>
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                        isVideoOff
                          ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/35"
                          : "bg-white/5 hover:bg-white/10 text-on-surface border-white/5"
                      }`}
                      title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isVideoOff ? "videocam_off" : "videocam"}
                      </span>
                    </button>
                  </div>

                  <div className="flex-grow max-w-sm px-4 hidden md:block">
                    <p className="text-xs font-bold text-white truncate text-center">
                      Streaming: "{currentLiveStream.title}"
                    </p>
                  </div>

                  <button
                    onClick={handleEndBroadcast}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs transition-colors active:scale-97 cursor-pointer shadow-lg shadow-red-600/25 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">stop</span>
                    End Stream
                  </button>
                </div>
              </div>

              {/* Side Stats Info Panel */}
              <div className="w-full lg:w-80 bg-surface-container/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md">
                <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">
                  Broadcast Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-on-surface-variant">Stream Title</span>
                    <span className="text-xs font-black text-white truncate max-w-[150px]">
                      {currentLiveStream.title}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-on-surface-variant">Active Duration</span>
                    <span className="text-xs font-black text-white">
                      {formatDuration(streamDuration)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-on-surface-variant">Viewers online</span>
                    <span className="text-xs font-black text-primary">
                      {currentLiveStream.viewerCount || 0}
                    </span>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center items-center p-6 text-center text-on-surface-variant/40 border border-dashed border-white/5 rounded-2xl mt-4">
                  <span className="material-symbols-outlined text-[32px] mb-2 animate-bounce">rocket_launch</span>
                  <p className="text-[10px] font-semibold leading-relaxed">
                    You are live to all online users! Other users can join your stream from the "Live" tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: VIEWER VIEW */}
          {currentLiveStream && !currentLiveStream.isBroadcaster && (
            <div className="flex-grow flex flex-col lg:flex-row gap-6 pt-6 h-full">
              {/* Remote Player Screen */}
              <div className="flex-grow flex flex-col bg-surface-container-lowest/40 rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl">
                
                {/* Header overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/30">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-auto">
                      <span className="material-symbols-outlined text-[13px]">group</span>
                      {currentLiveStream.viewerCount || 0} Viewers
                    </span>
                  </div>

                  <button
                    onClick={handleLeaveStream}
                    className="px-4 py-1.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white font-bold rounded-full text-[10px] transition-colors border border-white/5 hover:border-red-500/35 pointer-events-auto cursor-pointer"
                  >
                    Leave Stream
                  </button>
                </div>

                {/* Video Content */}
                <div className="flex-grow h-[450px] relative bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!currentLiveStream.remoteStream && (
                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin flex items-center justify-center" />
                      <p className="text-[11px] text-on-surface-variant font-bold">Connecting to broadcaster media feed...</p>
                    </div>
                  )}
                </div>

                {/* Stream Description Footer */}
                <div className="p-4 bg-surface-container-low/60 backdrop-blur-md border-t border-white/5 flex items-center gap-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                    src={getAvatarUrl(currentLiveStream.avatar)}
                    alt={currentLiveStream.username}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-white truncate">
                      {currentLiveStream.title}
                    </h2>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Broadcaster: @{currentLiveStream.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side Info Panel */}
              <div className="w-full lg:w-80 bg-surface-container/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">
                    Broadcast Info
                  </h3>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <img
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                      src={getAvatarUrl(currentLiveStream.avatar)}
                      alt={currentLiveStream.username}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">@{currentLiveStream.username}</p>
                      <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1">
                        Streamer
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Stream Topic</p>
                    <p className="text-xs font-bold text-white">
                      {currentLiveStream.title}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center mt-6">
                  <p className="text-[10px] text-on-surface-variant font-bold leading-normal">
                    P2P streaming is active. Audio and video tracks are connected directly to the broadcaster.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* START STREAM MODAL DIALOG */}
          {isStartDialogOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-surface-container-high border border-white/10 rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Close button */}
                <button
                  onClick={() => setIsStartDialogOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white absolute top-4 right-4 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">sensors</span>
                  Create Stream
                </h3>
                <p className="text-[10px] text-on-surface-variant leading-relaxed mb-4">
                  Set a descriptive title for your broadcast so viewers know what you are streaming.
                </p>

                <form onSubmit={handleStartBroadcast} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider ml-1">
                      Stream Title
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Chill Coding Session, Gaming Stream..."
                      className="w-full bg-surface-container border border-white/5 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:bg-surface-container-low transition-all"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-container hover:text-primary text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-primary/20 mt-2"
                  >
                    Start Broadcasting
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
