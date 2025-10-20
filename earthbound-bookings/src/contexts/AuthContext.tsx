import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types";
import { authApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  isAdmin: boolean;
  isInstructor: boolean;
  isMember: boolean;
  isStudioOwner: boolean; // Add this
  showSignInModal: boolean; // Add this
  setShowSignInModal: (show: boolean) => void; // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    setShowSignInModal(true);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isStudioOwner = isAdmin || isInstructor;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isInstructor,
        isMember: user?.role === "member",
        isStudioOwner,
        showSignInModal,
        setShowSignInModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};