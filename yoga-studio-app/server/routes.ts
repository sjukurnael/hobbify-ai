import type { Express } from "express";
import { createServer } from "http";
import passport from "./auth.js";
import { storage } from "./storage.js";
import { generateToken } from "./jwt.js";
import { authenticateToken, requireStudioOwner, type AuthRequest } from "./middleware.js";
import { insertUserSchema, insertClassSchema, insertBookingSchema } from "../shared/schema.js";

export async function registerRoutes(app: Express) {
  // ========== AUTH ROUTES ==========
  
  // Initiate Google OAuth login with role preference
  app.get('/auth/google',
    (req, res, next) => {
      const intendedRole = req.query.role as string;
      
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: intendedRole || 'customer'
      })(req, res, next);
    }
  );

  // Google OAuth callback - NOW RETURNS JWT TOKEN
  app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/?error=auth-failed` }),
    (req, res) => {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?error=no-user`);
      }

      // Generate JWT token
      const token = generateToken(user);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      
      // Redirect with token in URL (frontend will store it)
      if (user.role === 'admin' || user.role === 'instructor') {
        res.redirect(`${frontendUrl}/studio?token=${token}`);
      } else {
        res.redirect(`${frontendUrl}/classes?token=${token}`);
      }
    }
  );

  // Get current user from JWT token
  app.get('/auth/me', authenticateToken, (req: AuthRequest, res) => {
    res.json(req.user);
  });

  // Logout (just tell frontend to delete token)
  app.post('/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // ========== USER ROUTES ==========
  
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const requestedId = parseInt(req.params.id);
      
      if (isNaN(requestedId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(requestedId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== CLASS ROUTES ==========
  
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/upcoming", async (req, res) => {
    try {
      const classes = await storage.getUpcomingClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming classes" });
    }
  });

  app.get("/api/classes/:id", async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      const classItem = await storage.getClass(classId);
      if (!classItem) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  // ========== BOOKING ROUTES ==========
  
  app.get("/api/bookings", authenticateToken, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/user/:userId", authenticateToken, async (req, res) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      
      if (isNaN(requestedUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const bookings = await storage.getUserBookings(requestedUserId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  app.get("/api/bookings/class/:classId", authenticateToken, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      const bookings = await storage.getClassBookings(classId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class bookings" });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = req.user as any;
      
      const validatedData = insertBookingSchema.parse({
        classId: req.body.classId,
        userId: user.id,
      });
      
      const newBooking = await storage.createBooking(validatedData);
      res.status(201).json(newBooking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      if (error.message === "Class not found") {
        return res.status(404).json({ message: "Class not found" });
      }
      if (error.message === "Class is full") {
        return res.status(400).json({ message: "Class is full" });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/cancel", authenticateToken, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      await storage.cancelBooking(bookingId);
      res.json({ message: "Booking cancelled successfully" });
    } catch (error: any) {
      if (error.message === "Booking not found") {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // ========== STUDIO OWNER ROUTES ==========

  app.post("/api/classes", authenticateToken, requireStudioOwner, async (req, res) => {
    try {
      const dataWithDates = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      
      const validatedData = insertClassSchema.parse(dataWithDates);
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid class data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.patch("/api/classes/:id", authenticateToken, requireStudioOwner, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      const validatedData = insertClassSchema.partial().parse(req.body);
      const updatedClass = await storage.updateClass(classId, validatedData);
      
      if (!updatedClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      res.json(updatedClass);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid class data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", authenticateToken, requireStudioOwner, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      await storage.deleteClass(classId);
      res.json({ message: "Class deleted successfully" });
    } catch (error: any) {
      if (error.message === "Class not found") {
        return res.status(404).json({ message: "Class not found" });
      }
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}