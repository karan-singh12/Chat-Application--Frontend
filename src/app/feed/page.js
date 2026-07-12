"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { postService } from "@/services/postService";

export default function FeedPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentTexts, setNewCommentTexts] = useState({}); // postId -> text mapping

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fetchFeed = async () => {
    setIsLoading(true);
    const res = await postService.getFeed();
    if (res.success && res.data) {
      setPosts(res.data);
    }
    setIsLoading(false);
  };

  // Load posts from backend on mount
  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const res = await postService.createPost(newPostText);
    if (res.success && res.data) {
      setPosts([res.data, ...posts]);
      setNewPostText("");
    }
  };

  const handleLikePost = async (postId) => {
    const res = await postService.likePost(postId);
    if (res.success) {
      setPosts(posts.map((p) => {
        if (p.id === postId) {
          const hasLikedAlready = p.likes?.some((l) => l.userId === user?.id);
          let updatedLikes = p.likes ? [...p.likes] : [];
          if (hasLikedAlready) {
            updatedLikes = updatedLikes.filter((l) => l.userId !== user?.id);
          } else {
            updatedLikes.push({ postId, userId: user?.id });
          }
          return {
            ...p,
            likes: updatedLikes,
          };
        }
        return p;
      }));
    }
  };

  const handleToggleComments = (postId) => {
    setActiveCommentsPostId(activeCommentsPostId === postId ? null : postId);
  };

  const handleAddComment = async (postId) => {
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;

    const res = await postService.addComment(postId, text);
    if (res.success && res.data) {
      setPosts(posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), res.data],
          };
        }
        return p;
      }));

      setNewCommentTexts({
        ...newCommentTexts,
        [postId]: "",
      });
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
            {posts.length === 0 ? (
              <div className="bg-surface-container/20 border border-white/5 rounded-xl p-8 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
                  article
                </span>
                <p className="text-xs font-semibold text-white">No posts in the feed yet.</p>
                <p className="text-[10px] text-on-surface-variant/60 max-w-[250px] leading-relaxed">
                  Type a status update or technical note above and click "Post Update" to start sharing!
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const postUser = post.user || {};
                const postUserName = postUser.username || "Nexus Member";
                const postUserAvatar = postUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA";
                const postUserRole = postUser.role || "NexusChat Member";
                const postLikesCount = post.likes ? post.likes.length : 0;
                const postHasLiked = post.likes ? post.likes.some((l) => l.userId === user?.id) : false;
                const postCommentsList = post.comments || [];
                const postTime = getRelativeTime(post.createdAt);

                return (
                  <div
                    key={post.id}
                    className="bg-surface-container/30 border border-white/5 rounded-xl p-4 shadow-md flex flex-col gap-3"
                  >
                    {/* Post Header */}
                    <Link href={`/profile/${postUserName}`} className="flex items-center gap-3 hover:opacity-85 transition-all">
                      <img
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                        alt={postUserName}
                        src={postUserAvatar}
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white leading-none">
                          {postUserName}
                        </h4>
                        <p className="text-[9px] text-on-surface-variant/70 font-semibold mt-1">
                          {postUserRole} • {postTime}
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
                          postHasLiked ? "text-primary" : "text-on-surface-variant hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: postHasLiked ? "'FILL' 1" : "'FILL' 0" }}>
                          thumb_up
                        </span>
                        <span>{postLikesCount} Likes</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          chat_bubble
                        </span>
                        <span>{postCommentsList.length} Comments</span>
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
                        {postCommentsList.length > 0 ? (
                          <div className="space-y-3 pt-2.5 border-t border-white/5">
                            {postCommentsList.map((comment) => {
                              const commentUser = comment.user || {};
                              const commentUserName = commentUser.username || "Nexus Member";
                              const commentAvatar = commentUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQcF8dQPorLSDZ4Rd1sli_xw8cyVmzXJ-0WVavbWWmVasHbiE1InjgGpFJ2ulQgzGd4jUPk-9tobCI4JlXzfiN-Y1mws5XYx3NeywpFbIii-mOafHKwBhSzQE7UEYzlAwc_h1UKzjXQQK1baB1hvtRIZpcHusTy2ZplWy7GUZEBqiNzAbEmWItZlhbR0MYIa3W7-cCJl-CJKdX3GaDUAGcB2mZ-RK2nekLQ5VrFJfFR6IDejct2fsPA";
                              const commentTime = getRelativeTime(comment.createdAt);

                              return (
                                <div key={comment.id} className="flex gap-2.5 items-start">
                                  <Link href={`/profile/${commentUserName}`} className="hover:opacity-85 transition-opacity flex-shrink-0 mt-0.5">
                                    <img
                                      className="w-6.5 h-6.5 rounded-full object-cover border border-white/10"
                                      alt={commentUserName}
                                      src={commentAvatar}
                                    />
                                  </Link>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex-1">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                      <Link href={`/profile/${commentUserName}`} className="hover:underline">
                                        <span className="font-bold text-[10px] text-white">{commentUserName}</span>
                                      </Link>
                                      <span className="text-[8px] text-on-surface-variant/40">{commentTime}</span>
                                    </div>
                                    <p className="text-[10px] text-on-surface leading-normal select-text">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[9px] text-on-surface-variant/50 text-center py-2">
                            No comments yet. Start the conversation!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
