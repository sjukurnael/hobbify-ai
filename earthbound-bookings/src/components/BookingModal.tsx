import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, bookingsApi } from "@/services/api";
import type { Class } from "@/types";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
  onBookingComplete?: () => void;
}

export const BookingModal = ({ isOpen, onClose, classData, onBookingComplete }: BookingModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const spotsLeft = classData.maxCapacity - classData.currentCapacity;
  
  const handleLogin = () => {
    onClose();
    authApi.initiateGoogleLogin('customer');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a class",
        variant: "destructive",
      });
      handleLogin();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await bookingsApi.create({ 
        classId: classData.id,
        userId: user.id
      });
      
      toast({
        title: "Booking Confirmed!",
        description: `You're all set for ${classData.title}`,
      });
      
      onBookingComplete?.();
      onClose();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book class",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Your Class</DialogTitle>
          <DialogDescription>
            Confirm your booking for {classData.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{classData.title}</h3>
              <div className="flex items-center gap-1 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                {classData.price}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(classData.startTime), "EEEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(classData.startTime), "h:mm a")}</span>
              </div>
              {classData.instructor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {classData.instructor.firstName} {classData.instructor.lastName}
                  </span>
                </div>
              )}
            </div>

            {spotsLeft <= 5 && spotsLeft > 0 && (
              <div className="text-sm text-amber-600 font-medium">
                Only {spotsLeft} spots remaining!
              </div>
            )}
          </div>

          {user ? (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Booking as:</p>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900 mb-2">
                You need to sign in to book a class
              </p>
              <Button 
                onClick={handleLogin}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Sign In with Google
              </Button>
            </div>
          )}

          {user && (
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || spotsLeft === 0}
                className="flex-1"
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};