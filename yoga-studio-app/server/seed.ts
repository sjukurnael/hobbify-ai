import { db, pool } from "./db.js";
import { users, classes, bookings } from "../shared/schema.js";
import { storage } from "./storage.js";
import { sql } from "drizzle-orm";
import { config } from 'dotenv';

config();

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(bookings);
    await db.delete(classes);
    await db.delete(users);
    
    // Insert users
    console.log("Inserting users...");
    const insertedUsers = await db.insert(users)
      .values([
        {
          email: "admin@yogastudio.com",
          passwordHash: "hashed_password_123", // In production, use bcrypt
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          phone: "555-0100",
        },
        {
          email: "sarah.jones@yogastudio.com",
          passwordHash: "hashed_password_123",
          firstName: "Sarah",
          lastName: "Jones",
          role: "instructor",
          phone: "555-0101",
        },
        {
          email: "mike.chen@example.com",
          passwordHash: "hashed_password_123",
          firstName: "Mike",
          lastName: "Chen",
          role: "member",
          phone: "555-0102",
        },
        {
          email: "emma.wilson@example.com",
          passwordHash: "hashed_password_123",
          firstName: "Emma",
          lastName: "Wilson",
          role: "member",
          phone: "555-0103",
        },
      ])
      .returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Find instructor
    const instructor = insertedUsers.find(u => u.role === "instructor");
    if (!instructor) throw new Error("No instructor found");

    // Insert classes
    console.log("Inserting classes...");
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const insertedClasses = await db.insert(classes)
      .values([
        {
          title: "Vinyasa Flow",
          description: "A dynamic practice linking breath with movement. Perfect for building strength and flexibility.",
          instructorId: instructor.id,
          startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
          maxCapacity: 20,
          currentCapacity: 0,
          price: "25.00",
        },
        {
          title: "Power Yoga",
          description: "An intense, fitness-based approach to vinyasa yoga. Great for cardio and strength.",
          instructorId: instructor.id,
          startTime: new Date(tomorrow.setHours(18, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(19, 15, 0, 0)),
          maxCapacity: 15,
          currentCapacity: 0,
          price: "30.00",
        },
        {
          title: "Yin Yoga",
          description: "A slow-paced style with poses held for longer periods. Perfect for relaxation and flexibility.",
          instructorId: instructor.id,
          startTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
          endTime: new Date(tomorrow.setHours(21, 0, 0, 0)),
          maxCapacity: 25,
          currentCapacity: 0,
          price: "28.00",
        },
      ])
      .returning();
    console.log(`✅ Inserted ${insertedClasses.length} classes`);

    // Insert bookings using storage.createBooking() to properly update capacity
    console.log("Inserting bookings...");
    const members = insertedUsers.filter(u => u.role === "member");
    
    await storage.createBooking({
      userId: members[0].id,
      classId: insertedClasses[0].id,
      status: "confirmed",
      bookingDate: new Date(),
    });
    
    await storage.createBooking({
      userId: members[1].id,
      classId: insertedClasses[0].id,
      status: "confirmed",
      bookingDate: new Date(),
    });
    
    await storage.createBooking({
      userId: members[0].id,
      classId: insertedClasses[1].id,
      status: "confirmed",
      bookingDate: new Date(),
    });
    
    console.log(`✅ Inserted 3 bookings`);
    
    console.log("✨ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();