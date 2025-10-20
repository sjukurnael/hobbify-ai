import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Building2, X } from "lucide-react";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps) => {
  const handleSignIn = (role: 'customer' | 'studio-owner') => {
    // Redirect to Google OAuth with role parameter
    window.location.href = `http://localhost:3000/auth/google?role=${role}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className="relative p-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign in with Google</h2>
            <p className="text-muted-foreground">
              Choose how you want to access the platform
            </p>
          </div>

          <div className="space-y-4">
            {/* Customer Option */}
            <button
              onClick={() => handleSignIn('customer')}
              className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sign in as Customer</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and book yoga classes
                  </p>
                </div>
              </div>
            </button>

            {/* Studio Owner Option */}
            <button
              onClick={() => handleSignIn('studio-owner')}
              className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sign in as Studio Owner</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage classes and bookings
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            <strong>Note:</strong> Studio owner access requires approval. If your email is not approved, you'll be signed in as a customer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};