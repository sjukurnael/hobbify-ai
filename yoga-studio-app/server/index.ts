import express from "express";
import session from "express-session";
import passport from "./auth.js";
import { registerRoutes } from "./routes.js";
import cors from "cors";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// CORS must come BEFORE session
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://fastidious-begonia-48215d.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Trust Railway's proxy
  name: 'sessionId', // Custom name to avoid conflicts
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  }
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
  const server = await registerRoutes(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Backend URL: ${process.env.BACKEND_URL}`);
    console.log(`Secure cookies: ${isProduction}`);
  });
})();