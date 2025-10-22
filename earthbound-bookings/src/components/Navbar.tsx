import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Calendar, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, loading, isAdmin, isInstructor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogin = (role: 'customer' | 'studio-owner' = 'customer') => {
    authApi.initiateGoogleLogin(role);
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold text-primary">
          Serenity
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/classes"
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Classes
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    to="/my-bookings"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    My Bookings
                  </Link>

                  {(isAdmin || isInstructor) && (
                    <>
                      <Link
                        to="/studio"
                        className="text-sm font-medium text-foreground/80 hover:text-foreground"
                      >
                        Studio
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="text-sm font-medium text-foreground/80 hover:text-foreground"
                        >
                          Admin
                        </Link>
                      )}
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        {user.firstName}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        My Bookings
                      </DropdownMenuItem>
                      {(isAdmin || isInstructor) && (
                        <DropdownMenuItem onClick={() => navigate("/studio")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Studio
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleLogin('customer')}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => handleLogin('studio-owner')}>
                    Studio Owner Login
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}