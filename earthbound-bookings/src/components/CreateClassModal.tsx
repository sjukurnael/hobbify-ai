import { useState } from "react";
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
    startTime: defaultStartTime ? format(defaultStartTime, "yyyy-MM-dd'T'HH:mm") : "",
    endTime: defaultEndTime ? format(defaultEndTime, "yyyy-MM-dd'T'HH:mm") : "",
    maxCapacity: 20,
    price: "25.00",
  });

  // Update form when default times change
  useState(() => {
    if (defaultStartTime && defaultEndTime) {
      setFormData(prev => ({
        ...prev,
        startTime: format(defaultStartTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(defaultEndTime, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  });

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
      await classesApi.create({
        title: formData.title,
        description: formData.description,
        instructorId: user.id,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: formData.maxCapacity,
        price: formData.price,
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
        price: "25.00",
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
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
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