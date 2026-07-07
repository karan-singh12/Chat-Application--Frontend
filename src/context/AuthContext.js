"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on client side
    const savedUser = localStorage.getItem("nexus_user");
    const savedToken = localStorage.getItem("nexus_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        const userData = {
          email: res.data.user.email,
          username: res.data.user.username,
          role: res.data.user.role,
          avatar: res.data.user.avatar,
          bio: res.data.user.bio,
          phone: res.data.user.phone,
          location: res.data.user.location,
          credits: res.data.user.credits,
          isPro: res.data.user.isPro,
        };
        setUser(userData);
        setToken(res.data.token);
        localStorage.setItem("nexus_user", JSON.stringify(userData));
        localStorage.setItem("nexus_token", res.data.token);
        router.push("/dashboard");
        return { success: true };
      } else {
        throw new Error(res.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Auth login service error:", err);
      return { success: false, message: err.message };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await authService.signup(username, email, password);
      if (res.success) {
        const userData = {
          email: res.data.user.email,
          username: res.data.user.username,
          role: res.data.user.role,
          avatar: res.data.user.avatar,
          bio: res.data.user.bio,
          phone: res.data.user.phone,
          location: res.data.user.location,
          credits: res.data.user.credits,
          isPro: res.data.user.isPro,
        };
        setUser(userData);
        const signupToken = res.data.token || `jwt-mock-token-${userData.email.split("@")[0]}-${Date.now()}`;
        setToken(signupToken);
        localStorage.setItem("nexus_user", JSON.stringify(userData));
        localStorage.setItem("nexus_token", signupToken);
        router.push("/dashboard");
        return { success: true };
      } else {
        throw new Error(res.message || "Registration failed");
      }
    } catch (err) {
      console.error("Auth signup service error:", err);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("nexus_user");
    localStorage.removeItem("nexus_token");
    router.push("/login");
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setUser((prev) => {
          const updated = {
            ...prev,
            email: res.data.email,
            username: res.data.username,
            role: res.data.role,
            bio: res.data.bio,
            phone: res.data.phone,
            location: res.data.location,
            avatar: res.data.avatar,
            credits: res.data.credits,
            isPro: res.data.isPro,
          };
          localStorage.setItem("nexus_user", JSON.stringify(updated));
          return updated;
        });
        return res.data;
      }
    } catch (err) {
      console.error("Auth refreshProfile error:", err);
    }
    return null;
  };

  const updateCredits = (amount) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, credits: prev.credits + amount };
      localStorage.setItem("nexus_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateCredits, setUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
