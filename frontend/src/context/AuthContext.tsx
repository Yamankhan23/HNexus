/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  AuthContextType,
  AuthResponse,
  User,
} from "../types";

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  // Login
  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};
