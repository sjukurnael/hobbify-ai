import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CreateClassModal } from "@/components/CreateClassModal";
import { classesApi } from "@/services/api";
import type { Class } from "@/types";
import { format, startOfWeek, addDays, addHours, setHours, setMinutes, isSameHour, isSameDay } from "date-fns";
import { Loader2 } from "lucide-react";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 8am to 8pm
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Format price as Indonesian Rupiah
const formatRupiah = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `Rp ${numPrice.toLocaleString('id-ID')}`;
};

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

  // FIXED: Added callback to reload classes after creation
  const handleCreateSuccess = () => {
    loadClasses();
  };

  const getClassesForSlot = (dayIndex: number, hour: number) => {
    const slotDate = addDays(weekStart, dayIndex);
    const slotStart = setMinutes(setHours(slotDate, hour), 0);

    return classes.filter((cls) => {
      const classStart = new Date(cls.startTime);
      return (
        isSameDay(classStart, slotDate) &&
        isSameHour(classStart, slotStart)
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
                    const hasClasses = slotClasses.length > 0;
                    
                    return (
                      <td
                        key={dayIndex}
                        className="p-2 cursor-pointer hover:bg-primary/5 transition-colors relative"
                        onClick={() => handleTimeSlotClick(dayIndex, hour)}
                      >
                        {hasClasses ? (
                          <div className="flex flex-col gap-1 h-full min-h-[80px]">
                            {slotClasses.map((cls, index) => (
                              <div
                                key={cls.id}
                                className="rounded-md bg-primary/90 text-primary-foreground p-2 hover:bg-primary transition-colors overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  // FIXED: Better height calculation for multiple classes
                                  flex: 1,
                                  minHeight: `${80 / slotClasses.length - 4}px`
                                }}
                              >
                                <div className="text-xs font-semibold truncate">
                                  {cls.title}
                                </div>
                                <div className="text-[10px] opacity-90 truncate">
                                  {format(new Date(cls.startTime), "h:mm a")} - {format(new Date(cls.endTime), "h:mm a")}
                                </div>
                                {cls.instructor && (
                                  <div className="text-[10px] opacity-80 truncate">
                                    {cls.instructor.firstName} {cls.instructor.lastName}
                                  </div>
                                )}
                                <div className="text-[10px] opacity-80 truncate">
                                  {cls.currentCapacity}/{cls.maxCapacity} • {formatRupiah(cls.price)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center text-muted-foreground text-xs">
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

      {/* FIXED: Pass handleCreateSuccess callback */}
      <CreateClassModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
        defaultStartTime={selectedTimeSlot?.start}
        defaultEndTime={selectedTimeSlot?.end}
      />
    </div>
  );
};

export default Studio;