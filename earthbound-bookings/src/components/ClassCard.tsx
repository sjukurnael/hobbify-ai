// src/components/ClassCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users } from "lucide-react";
import type { Class } from "@/types";
import { format } from "date-fns";

interface ClassCardProps {
  classData: Class;
  onBook: () => void;
}

// Format price as Indonesian Rupiah
const formatRupiah = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `Rp ${numPrice.toLocaleString('id-ID')}`;
};

export const ClassCard = ({ classData, onBook }: ClassCardProps) => {
  const spotsLeft = classData.maxCapacity - classData.currentCapacity;
  const startTime = new Date(classData.startTime);
  const endTime = new Date(classData.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Card className="overflow-hidden transition-smooth hover:shadow-elevated animate-scale-in">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{classData.title}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            {formatRupiah(classData.price)}
          </Badge>
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {classData.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(startTime, "EEEE, MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(startTime, "h:mm a")} • {duration} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{spotsLeft} spots left</span>
        </div>
        {classData.instructor && (
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={classData.instructor.profilePicture} />
              <AvatarFallback>
                {classData.instructor.firstName[0]}{classData.instructor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {classData.instructor.firstName} {classData.instructor.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onBook} 
          className="w-full"
          variant={spotsLeft > 0 ? "default" : "outline"}
          disabled={spotsLeft === 0}
        >
          {spotsLeft > 0 ? "Book Class" : "Fully Booked"}
        </Button>
      </CardFooter>
    </Card>
  );
};