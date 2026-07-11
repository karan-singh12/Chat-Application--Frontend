"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentTexts, setNewCommentTexts] = useState({}); // postId -> text mapping

  // Mock initial social feed posts
  const [posts, setPosts] = useState([]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now(),
      user: {
        name: user?.username || "Alex Rivera",
        avatar: user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
        role: "NexusChat Member",
      },
      content: newPostText,
      time: "Just now",
      likes: 0,
      hasLiked: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const handleLikePost = (postId) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
            hasLiked: !p.hasLiked,
          };
        }
        return p;
      })
    );
  };

  const handleToggleComments = (postId) => {
    setActiveCommentsPostId(activeCommentsPostId === postId ? null : postId);
  };

  const handleAddComment = (postId) => {
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;

    const newComment = {
      id: Date.now(),
      userName: user?.username || "Alex Rivera",
      avatar: user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA",
      text: text,
      time: "Just now",
    };

    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    setNewCommentTexts({
      ...newCommentTexts,
      [postId]: "",
    });
  };

  return (
    <div className="bg-background flex min-h-screen overflow-hidden text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-sidebar-width h-screen overflow-y-auto flex flex-col relative z-10 custom-scrollbar pt-14 md:pt-0 pb-24 md:pb-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(77,94,247,0.05),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.03),transparent_45%)] pointer-events-none -z-10" />

        <div className="p-4 flex flex-col gap-5 max-w-[700px] mx-auto w-full">
          

          {/* Share Update Creator Card */}
          <div className="bg-surface-container/30 border border-white/5 rounded-xl p-4 shadow-md">
            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div className="flex gap-3">
                <img
                  className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 flex-shrink-0"
                  alt="My avatar"
                  src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA"}
                />
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-on-surface-variant/45 focus:ring-0 outline-none resize-none pt-1 min-h-[50px] leading-relaxed"
                  placeholder="Share a status update or technical note..."
                />
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">image</span>
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">gif_box</span>
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full hover:bg-white/5 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">code</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="px-5 py-1.5 bg-primary text-white font-bold rounded-full text-[10px] hover:brightness-110 active:scale-97 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-primary/10"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>

          {/* Social Posts feed list */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-surface-container/30 border border-white/5 rounded-xl p-4 shadow-md flex flex-col gap-3"
              >
                {/* Post Header */}
                <Link href={`/profile/${post.user.name}`} className="flex items-center gap-3 hover:opacity-85 transition-all">
                  <img
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                    alt={post.user.name}
                    src={post.user.avatar}
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white leading-none">
                      {post.user.name}
                    </h4>
                    <p className="text-[9px] text-on-surface-variant/70 font-semibold mt-1">
                      {post.user.role} • {post.time}
                    </p>
                  </div>
                </Link>

                {/* Post Body */}
                <p className="text-xs text-on-surface leading-relaxed select-text px-1 py-0.5">
                  {post.content}
                </p>

                {/* Post Interactions Action Row */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/5 px-1">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${
                      post.hasLiked ? "text-primary" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: post.hasLiked ? "'FILL' 1" : "'FILL' 0" }}>
                      thumb_up
                    </span>
                    <span>{post.likes} Likes</span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chat_bubble
                    </span>
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className="mt-2.5 bg-white/[0.01] border border-white/5 rounded-lg p-3 space-y-3 animate-fade-in">
                    {/* Add Comment Input */}
                    <div className="flex gap-2.5">
                      <input
                        value={newCommentTexts[post.id] || ""}
                        onChange={(e) =>
                          setNewCommentTexts({
                            ...newCommentTexts,
                            [post.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 bg-surface-container-low border border-white/5 rounded-full py-1.5 px-4 text-[10px] text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all outline-none"
                        placeholder="Write a comment..."
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 ? (
                      <div className="space-y-3 pt-2.5 border-t border-white/5">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2.5 items-start">
                            <Link href={`/profile/${comment.userName}`} className="hover:opacity-85 transition-opacity flex-shrink-0 mt-0.5">
                              <img
                                className="w-6.5 h-6.5 rounded-full object-cover border border-white/10"
                                alt={comment.userName}
                                src={comment.avatar}
                              />
                            </Link>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex-1">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <Link href={`/profile/${comment.userName}`} className="hover:underline">
                                  <span className="font-bold text-[10px] text-white">{comment.userName}</span>
                                </Link>
                                <span className="text-[8px] text-on-surface-variant/40">{comment.time}</span>
                              </div>
                              <p className="text-[10px] text-on-surface leading-normal select-text">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-on-surface-variant/50 text-center py-2">
                        No comments yet. Start the conversation!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
