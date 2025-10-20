import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, LogOut, Building2 } from "lucide-react";

export const Navbar = () => {
  const { user, loading, login, logout, isStudioOwner } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-display text-2xl font-bold text-primary">
          Serenity Studio
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Show different links based on user role */}
          {!isStudioOwner && (
            <Link to="/classes" className="text-sm font-medium transition-colors hover:text-primary">
              Classes
            </Link>
          )}
          
          {!loading && (
            <>
              {user ? (
                <>
                  {!isStudioOwner && (
                    <Link to="/my-bookings" className="text-sm font-medium transition-colors hover:text-primary">
                      My Bookings
                    </Link>
                  )}
                  
                  {isStudioOwner && (
                    <Link to="/studio" className="text-sm font-medium transition-colors hover:text-primary">
                      Studio
                    </Link>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePicture} alt={user.firstName} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {user.role === 'admin' ? 'Studio Owner' : user.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {!isStudioOwner && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/my-bookings" className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" />
                              My Bookings
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {isStudioOwner && (
                        <DropdownMenuItem asChild>
                          <Link to="/studio" className="cursor-pointer">
                            <Building2 className="mr-2 h-4 w-4" />
                            Studio Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={login}>
                  Sign in with Google
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};