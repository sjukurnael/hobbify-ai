import { pgTable, text, serial, integer, timestamp, boolean, varchar, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "instructor", "member"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "waitlist", "cancelled"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id")
    .notNull()
    .references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(20),
  currentCapacity: integer("current_capacity").default(0).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
.notNull()
    .references(() => users.id),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  instructedClasses: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  instructor: one(users, {
    fields: [classes.instructorId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [bookings.classId],
    references: [classes.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().nullable().optional(),
  role: z.enum(['admin', 'instructor', 'member']).optional(),
});

export const insertClassSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructorId: z.number().int().positive(),
  startTime: z.date(),
  endTime: z.date(),
  maxCapacity: z.number().int().positive().default(20),
  currentCapacity: z.number().int().min(0).optional().default(0),
  price: z.string().regex(/^\d+(\.\d{2})?$/),
});

export const insertBookingSchema = z.object({
  userId: z.number().positive(),
  classId: z.number().positive(),
  status: z.enum(['confirmed', 'waitlist', 'cancelled']).optional(),
  bookingDate: z.date().optional(),
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Composite types for queries with relations
export type ClassWithInstructor = Class & {
  instructor: User;
};

export type BookingWithDetails = Booking & {
  user: User;
  class: ClassWithInstructor;
};

export type ClassWithBookings = Class & {
  instructor: User;
  bookings: (Booking & { user: User })[];
};
