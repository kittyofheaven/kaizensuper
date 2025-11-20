"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LoginPayload,
  checkAdminAccess,
  fetchProfile,
  loginRequest,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAdmin: boolean | null;
  isReady: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<{ isAdmin: boolean }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAdmin(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
  }, []);

  const persistSession = useCallback((tokenValue: string, userValue: User) => {
    setToken(tokenValue);
    setUser(userValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", tokenValue);
      localStorage.setItem("authUser", JSON.stringify(userValue));
    }
  }, []);

  const hydrateFromStorage = useCallback(async () => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null;
    const storedUserRaw =
      typeof window !== "undefined"
        ? localStorage.getItem("authUser")
        : null;

    if (!storedToken || !storedUserRaw) {
      setIsReady(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUserRaw) as User;
      persistSession(storedToken, parsedUser);

      const admin = await checkAdminAccess(storedToken);
      setIsAdmin(admin);

      const profileRes = await fetchProfile(storedToken);
      persistSession(storedToken, profileRes.data);
    } catch {
      clearSession();
    } finally {
      setIsReady(true);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const response = await loginRequest(payload);
        const nextToken = response.data.token;
        const nextUser = response.data.user;

        persistSession(nextToken, nextUser);

        const admin = await checkAdminAccess(nextToken);
        setIsAdmin(admin);
        setIsReady(true);

        return { isAdmin: admin };
      } catch (error) {
        const err = error as ApiError;
        clearSession();
        setIsReady(true);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession, persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await fetchProfile(token);
      persistSession(token, profile.data);
    } catch {
      clearSession();
    }
  }, [clearSession, persistSession, token]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      isAdmin,
      isReady,
      isLoading,
      isAuthenticated: !!token,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isAdmin, isReady, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
