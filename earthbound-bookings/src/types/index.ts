export type UserRole = "admin" | "instructor" | "member";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  googleId?: string;
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Class {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCapacity: number;
  price: string;
  createdAt: string;
  instructor?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
  };
}

export type BookingStatus = "confirmed" | "waitlist" | "cancelled";

export interface Booking {
  id: number;
  userId: number;
  classId: number;
  status: BookingStatus;
  bookingDate: string;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  class?: Class;
}

export interface CreateClassData {
  title: string;
  description: string;
  instructorId: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  price: string;
}

export interface CreateBookingData {
  classId: number;
  userId?: number; // Add this line
}
