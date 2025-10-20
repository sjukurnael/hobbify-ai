import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CreateClassModal } from "@/components/CreateClassModal";
import { classesApi } from "@/services/api";
import type { Class } from "@/types";
import { format, startOfWeek, addDays, addHours, setHours, setMinutes } from "date-fns";
import { Loader2 } from "lucide-react";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 8am to 8pm
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Studio = () => {
  const { user, loading: authLoading, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Get the current week starting from Monday
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isInstructor))) {
      navigate("/");
      return;
    }
    if (user && (isAdmin || isInstructor)) {
      loadClasses();
    }
  }, [user, authLoading, isAdmin, isInstructor, navigate]);

  const loadClasses = async () => {
    try {
      const allClasses = await classesApi.getAll();
      setClasses(allClasses);
    } catch (error) {
      console.error("Failed to load classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (dayIndex: number, hour: number) => {
    const selectedDate = addDays(weekStart, dayIndex);
    const startTime = setMinutes(setHours(selectedDate, hour), 0);
    const endTime = addHours(startTime, 1);
    
    setSelectedTimeSlot({ start: startTime, end: endTime });
    setCreateModalOpen(true);
  };

  const getClassesForSlot = (dayIndex: number, hour: number) => {
    const slotDate = addDays(weekStart, dayIndex);
    const slotStart = setMinutes(setHours(slotDate, hour), 0);
    const slotEnd = addHours(slotStart, 1);

    return classes.filter((cls) => {
      const classStart = new Date(cls.startTime);
      return (
        classStart >= slotStart &&
        classStart < slotEnd
      );
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Studio Schedule</h1>
          <p className="text-muted-foreground">
            Click on any time slot to create a new class
          </p>
        </div>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-semibold min-w-[100px] sticky left-0 bg-muted/50">
                  Time
                </th>
                {DAYS.map((day, index) => {
                  const date = addDays(weekStart, index);
                  return (
                    <th key={day} className="p-4 text-center font-semibold min-w-[140px]">
                      <div>{day}</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {format(date, "MMM d")}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium border-r sticky left-0 bg-card">
                    {format(setHours(new Date(), hour), "h a")}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const slotClasses = getClassesForSlot(dayIndex, hour);
                    return (
                      <td
                        key={dayIndex}
                        className="p-2 cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => handleTimeSlotClick(dayIndex, hour)}
                      >
                        {slotClasses.length > 0 ? (
                          <div className="space-y-1">
                            {slotClasses.map((cls) => (
                              <div
                                key={cls.id}
                                className="text-xs p-2 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="font-semibold truncate">{cls.title}</div>
                                <div className="text-muted-foreground">
                                  {cls.currentCapacity}/{cls.maxCapacity}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateClassModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={loadClasses}
        defaultStartTime={selectedTimeSlot?.start}
        defaultEndTime={selectedTimeSlot?.end}
      />
    </div>
  );
};

export default Studio;
