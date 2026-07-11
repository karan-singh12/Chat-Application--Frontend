"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

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
    if (!agree) {
      setErrorMsg("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);
    const result = await signup(username, email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || "Account created successfully!");
      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setAgree(false);
    } else {
      setErrorMsg(result.message || "Failed to create account.");
    }
  };

  return (
    <div className="font-body-md text-on-surface p-gutter min-h-screen flex items-center justify-center relative overflow-hidden bg-background-app">
      {/* Ambient Blobs */}
      <div className="ambient-blob top-[-10%] left-[-10%] opacity-40"></div>
      <div
        className="ambient-blob bottom-[-10%] right-[-10%] opacity-40"
        style={{
          animationDelay: "-5s",
          background: "radial-gradient(circle, rgba(77, 94, 247, 0.08) 0%, transparent 70%)",
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

            <div className="flex items-start gap-2.5 px-2 py-1">
              <div className="relative flex items-center mt-0.5">
                <input
                  className="peer appearance-none w-4.5 h-4.5 rounded border border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="material-symbols-outlined absolute inset-0 text-white text-[12px] hidden peer-checked:flex items-center justify-center pointer-events-none">
                  check
                </span>
              </div>
              <label
                htmlFor="agree"
                className="text-[11px] font-semibold text-on-surface-variant cursor-pointer select-none leading-tight"
              >
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
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

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="h-[1px] flex-grow bg-white/5"></div>
            <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
              or signup with
            </span>
            <div className="h-[1px] flex-grow bg-white/5"></div>
          </div>

          {/* Social signup simulation */}
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => signup("google_user", "google@demo.com", "demopass123")}
              className="flex items-center justify-center gap-2.5 h-11 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all text-xs cursor-pointer"
              disabled={isLoading}
            >
              <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full">
                <img
                  className="w-3 h-3"
                  alt="Google logo"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmhtvdkdWEzPLGc_2zDwFSikRxWkOqoYrgIfdDgw_800O884_VxlWpQLRFfbcAOSCYYqc771EHyAwI9i7zVqNRGZOtbsH5IepQYPd2IDUQawmzmiKf8Lfp3AWabuvMLNeF138TywMed42iDGVDSxT5mIO2a7eRRuKakdKRRWG1jZbvFveXREm0_Gpso-ABanGPxoazgPtkc6qCylLk_bsVF3dJl4W7zsaRMPYXRR7GhHPAlYOMZSvAhg"
                />
              </div>
              Google
            </button>
            <button
              onClick={() => signup("github_user", "github@demo.com", "demopass123")}
              className="flex items-center justify-center gap-2.5 h-11 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all text-xs cursor-pointer"
              disabled={isLoading}
            >
              <img
                className="w-5 h-5 invert"
                alt="GitHub logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLJtCHUAYN5Fxl2q_LPQCo_ywhgaVA_K0-oRf7c0jpfRwxAumYYqwhnjH81Tme1ppnmKMLnq7N0WFWY5CXitE05VL1pOhgpUp0ttpswYNTBKy5XLR63hgf2mzn41CLXbNkgNMbiTR4lCaYHFvvJfvaf2mxFhEtXSWlJyT50jg5RuF5cVMcxNSeXlldZE5Ab9BOu1BDGK7hn_1b1EMmsKYk6mzFZM7csC62hAZjl87JofLezdKWf3ZxdQ"
              />
              GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <p className="text-xs text-on-surface-variant">
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
