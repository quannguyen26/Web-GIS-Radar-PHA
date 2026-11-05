import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken, getAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Perform initial session recovery on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Step 1: Request a new access token using HttpOnly refresh cookie
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data?.accessToken;
        setAccessToken(newAccessToken);

        // Step 2: Fetch detailed user profile using the new access token
        if (newAccessToken) {
          const userRes = await api.get("/users/me");
          setUser(userRes.data?.user || null);
        }
      } catch {
        // No valid session exists
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login action
  const login = async (username, password) => {
    try {
      // Authenticate with credentials and obtain access token
      const res = await api.post("/auth/signin", { username, password });
      const newAccessToken = res.data?.accessToken;
      setAccessToken(newAccessToken);

      // Fetch detailed profile for user
      const profileRes = await api.get("/users/me");
      setUser(profileRes.data?.user || res.data?.user || null);

      return { success: true, message: res.data?.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.";
      return { success: false, message };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await api.post("/auth/signout");
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const value = {
    user,
    token: getAccessToken(),
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
