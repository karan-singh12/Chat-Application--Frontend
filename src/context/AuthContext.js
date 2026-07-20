"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

const AuthContext = createContext();

const isTokenExpired = (jwtToken) => {
  if (!jwtToken) return true;
  try {
    const parts = jwtToken.split(".");
    if (parts.length !== 3) return false;
    const payloadBase64 = parts[1];
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexus_user");
      localStorage.removeItem("nexus_token");
    }
    router.push("/login");
  }, [router]);

  useEffect(() => {
    // Load from localStorage on client side
    const savedUser = localStorage.getItem("nexus_user");
    const savedToken = localStorage.getItem("nexus_token");
    if (savedUser && savedToken) {
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem("nexus_user");
        localStorage.removeItem("nexus_token");
        setUser(null);
        setToken(null);
      } else {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
      if (savedToken && isTokenExpired(savedToken)) {
        logout();
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 10000);
    return () => clearInterval(interval);
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        const userData = {
          id: res.data.user.id,
          email: res.data.user.email,
          username: res.data.user.username,
          role: res.data.user.role,
          avatar: res.data.user.avatar,
          bio: res.data.user.bio,
          phone: res.data.user.phone,
          location: res.data.user.location,
          credits: res.data.user.credits,
          isPro: res.data.user.isPro,
          createdAt: res.data.user.createdAt,
        };
        setUser(userData);
        setToken(res.data.token);
        localStorage.setItem("nexus_user", JSON.stringify(userData));
        localStorage.setItem("nexus_token", res.data.token);
        router.push("/chat");
        return { success: true };
      } else {
        throw new Error(res.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Auth login service error:", err);
      return { success: false, message: err.message };
    }
  };

  const signup = async (username, email, password, avatar = null) => {
    try {
      const res = await authService.signup(username, email, password, avatar);
      if (res.success) {
        const userData = {
          id: res.data.user.id,
          email: res.data.user.email,
          username: res.data.user.username,
          role: res.data.user.role,
          avatar: res.data.user.avatar,
          bio: res.data.user.bio,
          phone: res.data.user.phone,
          location: res.data.user.location,
          credits: res.data.user.credits,
          isPro: res.data.user.isPro,
          createdAt: res.data.user.createdAt,
        };
        setUser(userData);
        const signupToken = res.data.token || `jwt-mock-token-${userData.email.split("@")[0]}-${Date.now()}`;
        setToken(signupToken);
        localStorage.setItem("nexus_user", JSON.stringify(userData));
        localStorage.setItem("nexus_token", signupToken);
        router.push("/chat");
        return { success: true };
      } else {
        throw new Error(res.message || "Registration failed");
      }
    } catch (err) {
      console.error("Auth signup service error:", err);
      return { success: false, message: err.message };
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      if (res.data) {
        setUser((prev) => {
          const updated = {
            ...prev,
            id: res.data.id,
            email: res.data.email,
            username: res.data.username,
            role: res.data.role,
            bio: res.data.bio,
            phone: res.data.phone,
            location: res.data.location,
            avatar: res.data.avatar,
            credits: res.data.credits,
            isPro: res.data.isPro,
            createdAt: res.data.createdAt,
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
  }, []);

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
