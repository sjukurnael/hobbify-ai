import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { classesApi } from "@/services/api";
import { format } from "date-fns";

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
}

// Format number with thousand separators (500000 → 500,000)
const formatRupiah = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  // Add thousand separators
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    maxCapacity: 20,
    price: "25,000", // Default with formatting
  });

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

    setLoading(true);

    try {
      // Convert formatted price to raw number for API
      const rawPrice = parseRupiah(formData.price);
      
      await classesApi.create({
        title: formData.title,
        description: formData.description,
        instructorId: user.id,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: formData.maxCapacity,
        price: rawPrice, // Send raw number
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
          {/* Instructor Name (Read-only) */}
          {user && (
            <div>
              <Label>Instructor</Label>
              <Input
                value={`${user.firstName} ${user.lastName}`}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">Class Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vinyasa Flow"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
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
              <Label htmlFor="maxCapacity">Max Capacity</Label>
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
              <Label htmlFor="price">Price (Rp)</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
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