import React, { createContext, useContext, useEffect, useState } from "react";
import { refreshSession, login as apiLogin, register as apiRegister, logout as apiLogout } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const refreshedUser = await refreshSession(); // picks up an existing httpOnly cookie, if any
      if (refreshedUser) setUser(refreshedUser);
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const u = await apiLogin(username, password);
    setUser(u);
    return u;
  };
  const register = async (profile) => {
    const u = await apiRegister(profile);
    setUser(u);
    return u;
  };
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };
  const updateUser = (updates) => setUser((current) => ({ ...current, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
