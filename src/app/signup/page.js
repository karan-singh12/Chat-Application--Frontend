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
              Create your account to connect globally
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="w-full mb-6 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm font-label-md text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="w-full mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-label-md text-center">
              {successMsg}
            </div>
          )}

          {/* Signup Form */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  person
                </span>
                <input
                  className="input-glass w-full h-12 pl-12 pr-4 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 outline-none"
                  id="username"
                  placeholder="e.g. jordan_dev"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 py-1.5">
              <div className="relative flex items-center mt-0.5">
                <input
                  className="peer appearance-none w-5 h-5 rounded border border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="material-symbols-outlined absolute inset-0 text-on-primary text-[16px] hidden peer-checked:flex items-center justify-center pointer-events-none">
                  check
                </span>
              </div>
              <label
                htmlFor="agree"
                className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none leading-tight"
              >
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              className="btn-gradient w-full h-12 rounded-lg font-label-md text-on-primary font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-8">
            <div className="h-[1px] flex-grow bg-white/10"></div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
              or signup with
            </span>
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>

          {/* Social signup simulation */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => signup("google_user", "google@demo.com", "demopass123")}
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
              onClick={() => signup("git_coder", "github@demo.com", "demopass123")}
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

          {/* Login Link */}
          <p className="font-body-md text-on-surface-variant text-sm">
            Already have an account?
            <Link className="text-primary font-bold hover:text-surface-tint transition-colors ml-1" href="/login">
              Login
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
