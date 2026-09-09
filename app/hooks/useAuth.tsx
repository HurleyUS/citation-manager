import { useEffect, useState } from "react";

interface User {
  email: string;
  authenticated: boolean;
}

/**
 * Simple development auth hook
 * App-owned auth via /api/auth (Clerk deliberately not wired)
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (dev mode)
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setInitialized(true);
  }, []);

  const login = (email: string) => {
    const user = { email, authenticated: true };
    localStorage.setItem("auth_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return {
    user,
    initialized,
    isAuthenticated: user?.authenticated ?? false,
    login,
    logout,
  };
}
