import { createContext, useContext, ReactNode } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock user - matches a member from your seed data
  const mockUser: User = {
    id: 7,
    email: "mike.chen@example.com",
    firstName: "Mike",
    lastName: "Chen",
    role: "member",
    createdAt: new Date().toISOString(),
  };

  const login = () => {
    console.log("Mock login");
  };

  const logout = () => {
    console.log("Mock logout");
  };

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        loading: false,
        isAdmin: false,
        isInstructor: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}