"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassmorphicShowcase from "@/components/GlassmorphicShowcase";
import { API_BASE_URL } from "@/config/api";

export default function LandingPage() {
  const router = useRouter();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Ping backend health check in background to wake/keep the server active
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then((data) => console.log("Backend server health status:", data))
      .catch((err) => console.error("Error pinging backend server health status:", err));
  }, []);

  useEffect(() => {
    // Generate static metadata for hero background floating particles
    const particleList = [];
    for (let i = 0; i < 20; i++) {
      particleList.push({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(particleList);
  }, []);

  return (
    <div className="antialiased min-h-screen relative overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 bg-surface/30 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-gutter h-16">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-extrabold bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
            NexusChat
          </span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a
            className="font-label-md text-label-md text-primary font-bold hover:text-primary transition-colors"
            href="#"
          >
            Home
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#features"
          >
            Features
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#preview"
          >
            Interface
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Security
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="font-label-md text-label-md px-4 py-2 text-on-surface-variant hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="font-label-md text-label-md px-6 py-2 btn-primary rounded-full text-white font-bold"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-gutter overflow-hidden py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15)_0%,transparent_50%)] pointer-events-none"></div>

          {/* Floating background particles */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full bg-primary/20 blur-sm"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animation: `float-particles ${p.duration}s ease-in-out infinite alternate ${p.delay}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-primary/20 mb-8 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                Next Generation Messaging
              </span>
            </div>
            <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl mb-6 leading-[1.1] tracking-tight text-white">
              Connect <span className="text-gradient">Beyond</span> <br /> Boundaries
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience ultra-fast, encrypted, and seamless communication designed for the modern era. Where high performance meets sophisticated minimalism.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-[1.01]"
              >
                Start Chatting Now
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[18px]">
                  arrow_forward
                </span>
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-panel text-white font-semibold hover:bg-white/10 transition-all border border-white/20 text-sm flex items-center justify-center"
              >
                View Features
              </a>
            </div>
          </div>

          {/* Floating Preview Element - Glassmorphic Interactive UI Showcase */}
          <div className="mt-12 w-full max-w-5xl px-4 relative z-20">
            <GlassmorphicShowcase />
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-16 md:py-24 px-gutter max-w-container-max mx-auto" id="features">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-headline-lg mb-4 text-white">Engineered for Excellence</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
              Every detail refined for the ultimate communication workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* High Perf Chat */}
            <div className="md:col-span-8 glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3 text-white">Instant Synchronous Chat</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Real-time message delivery with millisecond latency. Built on advanced WebSockets for seamless global scaling.
                </p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors"></div>
              <div className="mt-12 flex gap-4 overflow-hidden">
                <div className="glass-card px-4 py-2 rounded-full text-xs font-medium text-primary border-primary/20 whitespace-nowrap">
                  Deliverability 99.9%
                </div>
                <div className="glass-card px-4 py-2 rounded-full text-xs font-medium text-tertiary border-tertiary/20 whitespace-nowrap">
                  End-to-End Encrypted
                </div>
                <div className="glass-card px-4 py-2 rounded-full text-xs font-medium text-white/50 border-white/10 whitespace-nowrap">
                  Global Edge-Network
                </div>
              </div>
            </div>

            {/* Secure by Design */}
            <div className="md:col-span-4 glass-card rounded-3xl p-6 md:p-8 flex flex-col group border-primary/5">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-6 text-error border border-error/20">
                <span className="material-symbols-outlined text-[28px]">shield</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-white">Fortified Security</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Military-grade AES-256 encryption for every packet. Your data never leaves your control.
              </p>
              <div className="mt-auto pt-8 flex justify-center">
                <span className="material-symbols-outlined text-[120px] text-error/10 group-hover:scale-110 transition-transform">
                  lock_person
                </span>
              </div>
            </div>

            {/* Voice/Video */}
            <div className="md:col-span-5 glass-card rounded-3xl p-6 md:p-8 flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6 text-tertiary border border-tertiary/20">
                <span className="material-symbols-outlined text-[28px]">videocam</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-white">Crystal Clear Voice</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Immersive audio quality with adaptive bitrate technology. Hear every nuance without the lag.
              </p>
            </div>

            {/* Integrations */}
            <div className="md:col-span-7 glass-card rounded-3xl p-6 md:p-8 flex items-center justify-between group overflow-hidden">
              <div className="max-w-[60%]">
                <h3 className="font-headline-md text-headline-md mb-3 text-white">Ecosystem Integration</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Connect your favorite workflow tools in seconds. Slack, Jira, GitHub—all in one hub.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center">
                  <span className="material-symbols-outlined">api</span>
                </div>
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center">
                  <span className="material-symbols-outlined">webhook</span>
                </div>
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center">
                  <span className="material-symbols-outlined">sync_alt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Preview / Dashboard Snapshot */}
        <section className="py-16 md:py-24 relative" id="preview">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none"></div>
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="font-headline-lg text-headline-lg mb-6 text-white">The Interface of the Future</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Say goodbye to cluttered sidebars and confusing settings. NexusChat utilizes a fluid, glassmorphic design that prioritizes your conversations.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-white">Adaptive Focus Mode</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Only see what matters. Intelligent filtering reduces noise.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-white">Unified Inbox</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">One place for all channels, groups, and direct messages.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Dashboard Interactive Component */}
            <div className="lg:col-span-7 glass-panel rounded-3xl overflow-hidden shadow-2xl border-white/10 flex h-[480px]">
              {/* Sidebar Rail */}
              <div className="w-[80px] h-full border-r border-white/5 flex flex-col items-center py-8 gap-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white font-bold mb-4 select-none">
                  N
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-[18px]">
                  home
                </span>
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  chat
                </span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-[18px]">
                  search
                </span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-[18px]">
                  call
                </span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-[18px]">
                  notifications
                </span>
                <div className="mt-auto">
                  <div
                    className="w-10 h-10 rounded-full bg-cover bg-center border border-white/20"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAo-GoCmY4YVJkgfyAVHi867mtHqonm5Lig1_KNiQUJ0u-hdcYX7lkpLDIaBJhSVnt1B1IKypQSXJcabVF4YG87w7fI3aKLmnheM92K-87ucHdpe00fN04M9zlhdBnSIj42G0MtzL761gkdZ8oxZpVmwbY8WQx_OXwGMGLLwzaQHpDEovdchJ5RODKILWgrYZQYqe37M03q4SKpAK4y2cVPyW8zZ6_uWC2Z2870Qqop3oioXZRecEzJGQ')",
                    }}
                  />
                </div>
              </div>
              {/* Content Area */}
              <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6">
                  <h3 className="font-headline-md text-headline-md text-white">Nexus General</h3>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white transition-colors">videocam</span>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white transition-colors">call</span>
                  </div>
                </header>
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  {/* Received */}
                  <div className="flex items-end gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo-GoCmY4YVJkgfyAVHi867mtHqonm5Lig1_KNiQUJ0u-hdcYX7lkpLDIaBJhSVnt1B1IKypQSXJcabVF4YG87w7fI3aKLmnheM92K-87ucHdpe00fN04M9zlhdBnSIj42G0MtzL761gkdZ8oxZpVmwbY8WQx_OXwGMGLLwzaQHpDEovdchJ5RODKILWgrYZQYqe37M03q4SKpAK4y2cVPyW8zZ6_uWC2Z2870Qqop3oioXZRecEzJGQ" alt="User Avatar" />
                    </div>
                    <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-none text-on-surface text-sm">
                      Did you upload your profile photo on the new signup page? It works flawlessly now!
                    </div>
                  </div>
                  {/* Sent */}
                  <div className="flex items-end gap-3 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container flex-shrink-0">ME</div>
                    <div className="btn-primary px-4 py-3 rounded-2xl rounded-br-none text-white text-sm shadow-lg shadow-primary/20">
                      Yes! I also tested the new Call History log and callback buttons. The latency is practically zero! 🚀
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="glass-panel w-full rounded-full h-12 flex items-center px-6 gap-4 border-white/10">
                    <span className="material-symbols-outlined text-on-surface-variant">mood</span>
                    <input
                      className="bg-transparent border-none focus:ring-0 flex-1 text-sm text-white placeholder:text-on-surface-variant outline-none"
                      placeholder="Send a message..."
                      type="text"
                      readOnly
                    />
                    <span className="material-symbols-outlined text-primary cursor-pointer">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-gutter">
          <div className="max-w-4xl mx-auto glass-panel rounded-[40px] p-8 md:p-12 text-center relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-tertiary/10 pointer-events-none"></div>
            <h2 className="font-display-lg text-display-lg mb-6 relative z-10 text-white">
              Ready to Elevate Your Communication?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of teams who trust NexusChat for their mission-critical communication needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                  <Link
                    href="/signup"
                    className="px-7 py-3.5 rounded-full btn-primary text-white font-bold text-sm w-full sm:w-auto flex items-center justify-center hover:scale-[1.01] transition-transform"
                  >
                    Get Started for Free
                  </Link>
                  <Link
                    href="/login"
                    className="px-7 py-3.5 rounded-full bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-white/10 w-full sm:w-auto flex items-center justify-center text-sm"
                  >
                    Login
                  </Link>
                </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <span className="font-headline-md text-headline-md font-extrabold bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent mb-6 block">
                NexusChat
              </span>
              <p className="text-on-surface-variant max-w-xs mb-8">
                Redefining digital proximity through high-performance messaging infrastructure.
              </p>
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-white mb-6">Product</h5>
              <ul className="space-y-4 text-on-surface-variant text-sm">
                <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-white mb-6">Company</h5>
              <ul className="space-y-4 text-on-surface-variant text-sm">
                <li><a className="hover:text-primary transition-colors" href="#">About</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-white mb-6">Legal</h5>
              <ul className="space-y-4 text-on-surface-variant text-sm">
                <li><a className="hover:text-primary transition-colors" href="#">Privacy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-on-surface-variant">© 2026 NexusChat. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                All systems operational
              </span>
              <span className="text-sm text-on-surface-variant cursor-pointer hover:text-white">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
