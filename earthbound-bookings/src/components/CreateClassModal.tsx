import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { classesApi, usersApi } from "@/services/api";
import { format } from "date-fns";
import type { User } from "@/types";

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
}

// Format number with thousand separators (500000 → 500,000)
const formatRupiah = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Remove formatting to get raw number
const parseRupiah = (value: string): string => {
  return value.replace(/,/g, '');
};

export const CreateClassModal = ({
  open,
  onOpenChange,
  onSuccess,
  defaultStartTime,
  defaultEndTime,
}: CreateClassModalProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    maxCapacity: 20,
    price: "25,000",
    instructorId: "",
  });

  // Load instructors when modal opens (only for admins)
  useEffect(() => {
    if (open && isAdmin) {
      loadInstructors();
    }
    
    // If user is an instructor (not admin), auto-select themselves
    if (open && user && !isAdmin) {
      setFormData(prev => ({
        ...prev,
        instructorId: user.id.toString(),
      }));
    }
  }, [open, user, isAdmin]);

  // Update form when default times change
  useEffect(() => {
    if (defaultStartTime && defaultEndTime) {
      setFormData(prev => ({
        ...prev,
        startTime: format(defaultStartTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(defaultEndTime, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [defaultStartTime, defaultEndTime]);

  const loadInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const allUsers = await usersApi.getAll();
      // Filter for instructors and admins (admins can also teach)
      const instructorUsers = allUsers.filter(
        u => u.role === 'instructor' || u.role === 'admin'
      );
      setInstructors(instructorUsers);
      
      // Auto-select current user if they're in the list
      if (user && instructorUsers.find(i => i.id === user.id)) {
        setFormData(prev => ({
          ...prev,
          instructorId: user.id.toString(),
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load instructors",
        variant: "destructive",
      });
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRupiah(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a class",
        variant: "destructive",
      });
      return;
    }

    if (!formData.instructorId) {
      toast({
        title: "Error",
        description: "Please select an instructor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const rawPrice = parseRupiah(formData.price);
      
      await classesApi.create({
        title: formData.title,
        description: formData.description,
        instructorId: parseInt(formData.instructorId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: formData.maxCapacity,
        price: rawPrice,
      });

      toast({
        title: "Success!",
        description: "Class created successfully",
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        maxCapacity: 20,
        price: "25,000",
        instructorId: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Instructor Selection - Different UI for Admin vs Instructor */}
          {isAdmin ? (
            <div>
              <Label htmlFor="instructor">Instructor *</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) => 
                  setFormData({ ...formData, instructorId: value })
                }
                disabled={loadingInstructors}
              >
                <SelectTrigger id="instructor">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                      {instructor.firstName} {instructor.lastName}
                      {instructor.role === 'admin' && ' (Admin)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {instructors.length === 0 && !loadingInstructors && (
                <p className="text-xs text-muted-foreground mt-1">
                  No instructors found. Add instructors from the Admin panel.
                </p>
              )}
            </div>
          ) : (
            <div>
              <Label>Instructor</Label>
              <Input
                value={user ? `${user.firstName} ${user.lastName}` : ''}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vinyasa Flow"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the class..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxCapacity">Max Capacity *</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (Rp) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="price"
                  type="text"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="25,000"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};