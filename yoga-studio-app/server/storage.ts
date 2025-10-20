import { db } from "./db.js";
import { users, classes, bookings, type User, type Class, type Booking, type InsertUser, type InsertClass, type InsertBooking } from "../shared/schema.js";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class operations
  getClasses(): Promise<any[]>;
  getClass(id: number): Promise<any | undefined>;
  getUpcomingClasses(): Promise<any[]>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Booking operations
  getBookings(): Promise<any[]>;
  getUserBookings(userId: number): Promise<any[]>;
  getClassBookings(classId: number): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role || "member",
    }).returning();
    return newUser;
  }

  // Classes
  async getClasses(): Promise<any[]> {
    return await db.query.classes.findMany({
      with: {
        instructor: true,
      },
      orderBy: (classes, { asc }) => [asc(classes.startTime)],
    });
  }

  async getClass(id: number): Promise<any | undefined> {
    return await db.query.classes.findFirst({
      where: eq(classes.id, id),
      with: {
        instructor: true,
        bookings: {
          with: {
            user: true,
          },
        },
      },
    });
  }

  async getUpcomingClasses(): Promise<any[]> {
    const now = new Date();
    return await db.query.classes.findMany({
      where: gte(classes.startTime, now),
      with: {
        instructor: true,
      },
      orderBy: (classes, { asc }) => [asc(classes.startTime)],
    });
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values({
      title: classData.title,
      description: classData.description,
      instructorId: classData.instructorId,
      startTime: classData.startTime,
      endTime: classData.endTime,
      maxCapacity: classData.maxCapacity || 20,
      currentCapacity: classData.currentCapacity || 0,
      price: classData.price,
    }).returning();
    return newClass;
  }

  // Bookings
  async getBookings(): Promise<any[]> {
    return await db.query.bookings.findMany({
      with: {
        user: true,
        class: {
          with: {
            instructor: true,
          },
        },
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });
  }

  async getUserBookings(userId: number): Promise<any[]> {
    return await db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: {
        class: {
          with: {
            instructor: true,
          },
        },
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });
  }

  async getClassBookings(classId: number): Promise<any[]> {
    return await db.query.bookings.findMany({
      where: eq(bookings.classId, classId),
      with: {
        user: true,
      },
    });
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // ✅ Check if class exists and has capacity
    const classItem = await db.query.classes.findFirst({
      where: eq(classes.id, booking.classId),
    });

    if (!classItem) {
      throw new Error("Class not found");
    }

    if (classItem.currentCapacity >= classItem.maxCapacity) {
      throw new Error("Class is full");
    }

    // ✅ Create the booking
    const [newBooking] = await db.insert(bookings).values({
      userId: booking.userId,
      classId: booking.classId,
      status: booking.status || "confirmed",
      bookingDate: booking.bookingDate || new Date(),
    }).returning();

    // ✅ Increment class capacity (only if status is "confirmed")
    if (newBooking.status === "confirmed") {
      await db.update(classes)
        .set({ 
          currentCapacity: sql`${classes.currentCapacity} + 1` 
        })
        .where(eq(classes.id, booking.classId));
    }

    return newBooking;
  }

  async cancelBooking(id: number): Promise<void> {
    // ✅ Get the booking first to know which class to update
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // ✅ Update booking status to cancelled
    await db.update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id));

    // ✅ Decrement capacity if the booking was confirmed
    if (booking.status === "confirmed") {
      await db.update(classes)
        .set({ 
          currentCapacity: sql`${classes.currentCapacity} - 1` 
        })
        .where(eq(classes.id, booking.classId));
    }
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const [updatedClass] = await db.update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: number): Promise<void> {
    const classItem = await this.getClass(id);
    if (!classItem) {
      throw new Error("Class not found");
    }
    
    // Delete associated bookings first
    await db.delete(bookings).where(eq(bookings.classId, id));
    
    // Delete the class
    await db.delete(classes).where(eq(classes.id, id));
  }
}

export const storage = new DatabaseStorage();