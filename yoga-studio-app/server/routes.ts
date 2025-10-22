import type { Express } from "express";
import { createServer } from "http";
import passport from "./auth.js";
import { storage } from "./storage.js";
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

  // Google OAuth callback
  app.get('/auth/google/callback',
    (req, res, next) => {
      console.log('🔵 CALLBACK HIT!');
      console.log('Query params:', req.query);
      next();
    },
    passport.authenticate('google', {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}`
    }),
    (req, res) => {
      console.log('✅ AUTH SUCCESS');
      console.log('User:', req.user);
      console.log('Session ID:', req.sessionID);
      console.log('Session:', req.session);
      
      const intendedRole = (req.session as any).intendedRole;
      const user = req.user as any;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      
      if (!user) {
        console.log('❌ No user after auth');
        return res.redirect(`${frontendUrl}/classes?error=no-user`);
      }
      
      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.redirect(`${frontendUrl}/classes?error=session-failed`);
        }
        
        console.log('💾 Session saved successfully');
        console.log('📤 Cookies will be set');
        
        // Manually set cookie header for debugging
        const cookies = res.getHeader('Set-Cookie');
        console.log('🍪 Set-Cookie:', cookies);
        
        if (intendedRole === 'studio-owner' && user.role !== 'admin' && user.role !== 'instructor') {
          console.log('↪️ Redirecting to classes (not authorized)');
          res.redirect(`${frontendUrl}/classes?message=not-authorized`);
        } else if (intendedRole === 'studio-owner' && (user.role === 'admin' || user.role === 'instructor')) {
          console.log('↪️ Redirecting to studio');
          res.redirect(`${frontendUrl}/studio`);
        } else {
          console.log('↪️ Redirecting to classes');
          res.redirect(`${frontendUrl}/classes`);
        }
      });
    }
  );

  app.get('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:8080');
    });
  });

  app.get('/auth/me', (req, res) => {
    console.log('🔍 /auth/me called');
    console.log('Session ID:', req.sessionID);
    console.log('Authenticated:', req.isAuthenticated());
    console.log('User:', req.user);
    
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // ========== USER ROUTES ==========
  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
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

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
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
  
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/user/:userId", async (req, res) => {
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

  app.get("/api/bookings/class/:classId", async (req, res) => {
    try {
      const classId = parseInt(req.params.classId);
      
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      const bookings = await storage.getClassBookings(classId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Must be logged in to book a class" });
      }
  
      // Use authenticated user's ID instead of trusting request body
      const validatedData = insertBookingSchema.parse({
        classId: req.body.classId,
        userId: (req.user as any).id, // ← Get from session
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

  app.patch("/api/bookings/:id/cancel", async (req, res) => {
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

  // ========== STUDIO OWNER ROUTES (Protected) ==========

  const requireStudioOwner = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Studio owner access required.' });
    }
    
    next();
  };

  // ⚠️ FIXED: Only ONE POST /api/classes route
  app.post("/api/classes", requireStudioOwner, async (req, res) => {
    try {
      console.log("Received data:", req.body);
      
      const dataWithDates = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      
      const validatedData = insertClassSchema.parse(dataWithDates);
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (error: any) {
      console.error("Error details:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid class data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.patch("/api/classes/:id", requireStudioOwner, async (req, res) => {
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

  app.delete("/api/classes/:id", requireStudioOwner, async (req, res) => {
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
