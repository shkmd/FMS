"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken, getAccessToken } from "./api-client";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  employee?: { id: string; employeeCode: string } | null;
}

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  // The refresh-token cookie rotates on every use, so two concurrent /auth/refresh calls (e.g. React
  // dev-mode double-invoking this effect) would make the second one fail against an already-used token.
  const bootstrapRef = React.useRef<Promise<void> | null>(null);

  // Throws on failure so callers (bootstrap) can tell a stale access token apart from success.
  const loadMeOrThrow = React.useCallback(async () => {
    const me = await api.get<CurrentUser>("/auth/me");
    setUser(me);
  }, []);

  const loadMe = React.useCallback(async () => {
    try {
      await loadMeOrThrow();
    } catch {
      setUser(null);
    }
  }, [loadMeOrThrow]);

  const bootstrap = React.useCallback(async () => {
    setLoading(true);
    try {
      if (getAccessToken()) {
        // The stored access token may have expired since the last visit — fall back to the
        // refresh-token cookie instead of logging the user out on a stale-but-recoverable token.
        try {
          await loadMeOrThrow();
          return;
        } catch {
          setAccessToken(null);
        }
      }
      const res = await api.post<{ accessToken: string }>("/auth/refresh");
      setAccessToken(res.accessToken);
      await loadMeOrThrow();
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadMeOrThrow]);

  React.useEffect(() => {
    if (!bootstrapRef.current) {
      bootstrapRef.current = bootstrap().finally(() => {
        bootstrapRef.current = null;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ accessToken: string; user: CurrentUser }>("/auth/login", { email, password });
      setAccessToken(res.accessToken);
      setUser(res.user);
    },
    [],
  );

  const logout = React.useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const hasPermission = React.useCallback(
    (code: string) => !!user && (user.permissions.includes("platform:manage") || user.permissions.includes(code)),
    [user],
  );

  const value: AuthContextValue = { user, loading, login, logout, hasPermission, refresh: loadMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
