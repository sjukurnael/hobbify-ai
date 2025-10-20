import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi } from "@/services/api";
import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, DollarSign, User } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, navigate]);

  const loadBookings = async () => {
    if (!user) return;
    
    try {
      const data = await bookingsApi.getByUserId(user.id);
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingsApi.cancel(bookingId);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <p className="text-center">Loading...</p>
        </main>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && b.class && new Date(b.class.startTime) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.class && new Date(b.class.startTime) <= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">My Bookings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your class reservations
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Upcoming Classes</h2>
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <Button asChild className="mt-4">
                    <a href="/classes">Browse Classes</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">
                          {booking.class?.title}
                        </CardTitle>
                        <Badge>
                          {booking.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {booking.class?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.class && format(new Date(booking.class.startTime), "EEEE, MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {booking.class && format(new Date(booking.class.startTime), "h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{booking.class?.price}</span>
                        </div>
                        {booking.class?.instructor && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              {booking.class.instructor.firstName} {booking.class.instructor.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Past Classes</h2>
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No past bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">
                          {booking.class?.title}
                        </CardTitle>
                        <Badge variant="secondary">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.class && format(new Date(booking.class.startTime), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
