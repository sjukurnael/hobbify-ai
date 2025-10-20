import express from "express";
import session from "express-session";
import passport from "./auth.js";
import { registerRoutes } from "./routes.js";
import cors from "cors";

const app = express();

// CORS - Allow frontend to make requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
  const server = await registerRoutes(app);

  // ✅ Convert PORT to a number
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Backend URL: ${process.env.BACKEND_URL}`);
  });
})();