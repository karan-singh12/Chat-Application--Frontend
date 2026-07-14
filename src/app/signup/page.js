"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export default function SignUpPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB.");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    setAvatarFile(file);
    const localUrl = URL.createObjectURL(file);
    
    // Revoke old URL if exists to prevent leaks
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    
    setAvatarPreview(localUrl);
    setErrorMsg("");
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xRotation = (clientY / innerHeight - 0.5) * 4;
      const yRotation = (clientX / innerWidth - 0.5) * -4;
      card.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
      card.style.transition = "none";
    };

    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      card.style.transition = "transform 0.5s ease";
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.body.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    let uploadedAvatarUrl = null;

    try {
      if (avatarFile) {
        const uploadRes = await authService.uploadPublicAvatar(avatarFile);
        if (uploadRes.success && uploadRes.data) {
          uploadedAvatarUrl = uploadRes.data.url;
        } else {
          setErrorMsg(uploadRes.message || "Failed to upload profile photo.");
          setIsLoading(false);
          return;
        }
      }

      const result = await signup(username, email, password, uploadedAvatarUrl);
      setIsLoading(false);

      if (result.success) {
        setSuccessMsg(result.message || "Account created successfully!");
        // Reset form
        setUsername("");
        setEmail("");
        setPassword("");
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setErrorMsg(result.message || "Failed to create account.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="font-body-md text-on-surface p-gutter min-h-screen flex items-center justify-center relative overflow-hidden bg-background-app cyber-grid"
      style={{
        background: "radial-gradient(circle at center, #16193f 0%, #090a10 100%)"
      }}
    >
      {/* Ambient Blobs */}
      <div className="ambient-blob top-[-10%] left-[-10%] opacity-70"></div>
      <div
        className="ambient-blob bottom-[-10%] right-[-10%] opacity-70"
        style={{
          animationDelay: "-5s",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)",
        }}
      ></div>

      <main className="w-full max-w-[430px] z-10 select-none">
        <div
          ref={cardRef}
          className="bg-surface-container/45 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 sm:p-10 flex flex-col items-center shadow-2xl"
        >
          {/* Brand Identity */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4 select-none animate-fade-in hover:scale-105 hover:rotate-2 transition-transform duration-300">
              <svg className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-1-signup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="logo-grad-2-signup" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <rect x="20" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1-signup)" />
                <rect x="65" y="18" width="15" height="64" rx="7.5" fill="url(#logo-grad-1-signup)" />
                <path d="M27.5 18 L72.5 82" stroke="url(#logo-grad-2-signup)" strokeWidth="15" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              NexusChat
            </h1>
            <p className="text-[11px] text-on-surface-variant font-semibold mt-1">
              Create an account and connect globally
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="w-full mb-5 p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs font-semibold text-center select-text">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="w-full mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center select-text">
              {successMsg}
            </div>
          )}

          {/* Signup Form */}
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Profile Photo Selector */}
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full relative overflow-hidden group border-2 border-dashed border-white/20 hover:border-primary/50 transition-all duration-300 flex items-center justify-center cursor-pointer bg-white/5 shadow-inner"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-on-surface-variant/60 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[36px]">
                      add_a_photo
                    </span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[20px] mb-1">
                    photo_camera
                  </span>
                  <span>
                    {avatarPreview ? "Change" : "Upload"}
                  </span>
                </div>
              </div>
              
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isLoading}
                  className="mt-2 text-[10px] font-bold text-error hover:underline tracking-wide uppercase transition-colors bg-transparent border-none cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
              
              {!avatarPreview && (
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-2">
                  Profile Photo (Optional)
                </span>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-4" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  person
                </span>
                <input
                  className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                  id="username"
                  placeholder="e.g. jordan_dev"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-4" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  mail
                </span>
                <input
                  className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-4" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock
                </span>
                <input
                  className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                  id="password"
                  placeholder="Min. 8 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>



            <button
              className="btn-primary w-full h-11 rounded-full text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-xs mt-3"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
              <span className="material-symbols-outlined text-[16px]">person_add</span>
            </button>
          </form>



          {/* Sign In Link */}
          <p className="text-xs text-on-surface-variant mt-6">
            Already have an account?
            <Link className="text-primary font-extrabold hover:underline ml-1.5" href="/login">
              Login
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <footer className="mt-6 flex justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300 text-[10px] font-semibold">
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            Help Center
          </a>
        </footer>
      </main>
    </div>
  );
}
