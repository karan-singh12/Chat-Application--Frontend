"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xRotation = (clientY / innerHeight - 0.5) * 4; // Max 2 degrees
      const yRotation = (clientX / innerWidth - 0.5) * -4; // Max 2 degrees
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
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) {
      setErrorMsg(result.message || "Failed to log in.");
    }
  };

  return (
    <div className="font-body-md text-on-surface p-gutter min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient Blobs */}
      <div className="ambient-blob top-[-10%] left-[-10%]"></div>
      <div
        className="ambient-blob bottom-[-10%] right-[-10%]"
        style={{
          animationDelay: "-5s",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
        }}
      ></div>

      <main className="w-full max-w-[440px] z-10">
        <div
          ref={cardRef}
          className="glass-card rounded-xl p-10 flex flex-col items-center"
        >
          {/* Brand Identity */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-tertiary mb-6 shadow-lg shadow-primary/20">
              <span
                className="material-symbols-outlined text-on-primary text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                hub
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent mb-2">
              NexusChat
            </h1>
            <p className="font-label-md text-label-md text-on-surface-variant">
              The next generation of professional connectivity
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mb-6 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm font-label-md text-center">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  className="input-glass w-full h-12 pl-12 pr-4 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 outline-none"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="input-glass w-full h-12 pl-12 pr-4 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 outline-none"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="peer appearance-none w-5 h-5 rounded border border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    type="checkbox"
                    disabled={isLoading}
                  />
                  <span className="material-symbols-outlined absolute inset-0 text-on-primary text-[16px] hidden peer-checked:flex items-center justify-center pointer-events-none">
                    check
                  </span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <a className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors" href="#">
                Forgot password?
              </a>
            </div>

            <button
              className="btn-gradient w-full h-12 rounded-lg font-label-md text-on-primary font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-8">
            <div className="h-[1px] flex-grow bg-white/10"></div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
              or continue with
            </span>
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>

          {/* Social Logins */}
          <div className="w-full grid grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => login("google-demo@nexuschat.io", "demopass")}
              className="social-btn flex items-center justify-center gap-3 h-12 rounded-lg font-label-md text-on-surface"
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
              onClick={() => login("github-demo@nexuschat.io", "demopass")}
              className="social-btn flex items-center justify-center gap-3 h-12 rounded-lg font-label-md text-on-surface"
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

          {/* Sign Up Link */}
          <p className="font-body-md text-on-surface-variant text-sm">
            Don't have an account?
            <Link className="text-primary font-bold hover:text-surface-tint transition-colors ml-1" href="/signup">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <footer className="mt-8 flex justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500 text-xs">
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">
            Help Center
          </a>
        </footer>
      </main>
    </div>
  );
}
