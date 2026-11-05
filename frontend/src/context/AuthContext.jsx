import React, { createContext, useContext, useState, useEffect } from "react";
import api, {
  setAccessToken,
  setOnAuthFailure,
  refreshAccessToken,
} from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear user state whenever the axios interceptor fails to refresh the session
  useEffect(() => {
    setOnAuthFailure(() => setUser(null));
    return () => setOnAuthFailure(null);
  }, []);

  // Restore session on mount (refresh calls are de-duplicated in api.js,
  // so the StrictMode double mount only hits /auth/refresh once)
  useEffect(() => {
    let isCancelled = false;

    const initializeAuth = async () => {
      try {
        // Step 1: Obtain a new access token using the HttpOnly refresh cookie
        await refreshAccessToken();

        // Step 2: /auth/refresh only returns the token, so fetch the profile
        const profileRes = await api.get("/users/me");
        if (!isCancelled) setUser(profileRes.data?.user || null);
      } catch {
        // No valid session exists
        setAccessToken(null);
        if (!isCancelled) setUser(null);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Login action
  const login = async (username, password) => {
    try {
      // /auth/signin returns both the access token and the user profile
      const res = await api.post("/auth/signin", { username, password });
      setAccessToken(res.data?.accessToken);
      setUser(res.data?.user || null);

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
