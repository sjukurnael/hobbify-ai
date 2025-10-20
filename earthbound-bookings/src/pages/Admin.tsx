import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { classesApi, bookingsApi } from "@/services/api";
import type { Class, Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

const Admin = () => {
  const { user, loading: authLoading, isAdmin, isInstructor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (!authLoading && user && !isAdmin && !isInstructor) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (user && (isAdmin || isInstructor)) {
      loadData();
    }
  }, [user, authLoading, isAdmin, isInstructor, navigate]);

  const loadData = async () => {
    try {
      const [classesData, bookingsData] = await Promise.all([
        classesApi.getAll(),
        bookingsApi.getAll(),
      ]);
      setClasses(classesData);
      setBookings(bookingsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" && b.class)
    .reduce((sum, b) => sum + parseFloat(b.class?.price || "0"), 0);

  const upcomingClasses = classes.filter(
    (c) => new Date(c.startTime) > new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your yoga studio
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingClasses.length} upcoming
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                {bookings.filter((b) => b.status === "confirmed").length} confirmed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From confirmed bookings
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">All Classes</h2>
              <Button>Create New Class</Button>
            </div>
            
            <div className="grid gap-4">
              {classes.map((classItem) => (
                <Card key={classItem.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{classItem.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(classItem.startTime), "EEEE, MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${classItem.price}</p>
                        <p className="text-sm text-muted-foreground">
                          {classItem.currentCapacity}/{classItem.maxCapacity} booked
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {classItem.description}
                    </p>
                    {classItem.instructor && (
                      <p className="text-sm mt-2">
                        Instructor: {classItem.instructor.firstName} {classItem.instructor.lastName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-2xl font-semibold">All Bookings</h2>
            
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{booking.class?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.user?.firstName} {booking.user?.lastName} ({booking.user?.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Booked: {format(new Date(booking.bookingDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{booking.status}</p>
                        <p className="text-sm text-muted-foreground">${booking.class?.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
