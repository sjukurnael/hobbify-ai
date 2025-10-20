  // src/pages/Classes.tsx
  import { useState, useEffect } from "react";
  import { Navbar } from "@/components/Navbar";
  import { ClassCard } from "@/components/ClassCard";
  import { BookingModal } from "@/components/BookingModal";
  import { Input } from "@/components/ui/input";
  import { Search } from "lucide-react";
  import { classesApi } from "@/services/api";
  import { useAuth } from "@/contexts/AuthContext"; // ← ADD THIS LINE
  import type { Class } from "@/types";
  import { useToast } from "@/hooks/use-toast";

  // Remove these image imports
  // import morningImg from "@/assets/class-morning.jpg";
  // import vinyasaImg from "@/assets/class-vinyasa.jpg";
  // import restorativeImg from "@/assets/class-restorative.jpg";


  const Classes = () => {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth(); // ← Rename this one
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true); // ← Keep this one for classes loading
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
      loadClasses();
    }, []);

    const loadClasses = async () => {
      try {
        const data = await classesApi.getUpcoming();
        setClasses(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const handleBook = (classData: Class) => {
      setSelectedClass(classData);
      setIsBookingModalOpen(true);
    };

    const filteredClasses = classes.filter((classItem) => {
      const matchesSearch = 
        classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (classItem.instructor && 
          `${classItem.instructor.firstName} ${classItem.instructor.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    });

    if (loading) { // ← This is for classes loading
      return (
        <div className="min-h-screen bg-gradient-soft">
          <Navbar />
          <main className="container mx-auto px-4 py-12">
            <p className="text-center">Loading classes...</p>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Browse Classes</h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect class for your practice
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classes, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {classes.length === 0 ? "No upcoming classes available" : "No classes found matching your search"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classData={classItem}
                onBook={() => handleBook(classItem)}
              />
            ))}
          </div>
          )}
        </main>

        {selectedClass && !authLoading && ( // ← Use authLoading here
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            classData={selectedClass}
            onBookingComplete={loadClasses}
          />
        )}
      </div>
    );
  };

  export default Classes;