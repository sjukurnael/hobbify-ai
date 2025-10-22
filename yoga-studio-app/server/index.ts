import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "./auth.js";
import { registerRoutes } from "./routes.js";
import { pool } from "./db.js";
import cors from "cors";

const app = express();
const PgSession = connectPg(session);
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy - CRITICAL for Railway
app.set('trust proxy', 1);

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

// PostgreSQL session store
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  name: 'connect.sid',
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  }
}));

// Debug middleware - ADD THIS
app.use((req, res, next) => {
  console.log('📍', req.method, req.path);
  console.log('🍪 Cookies:', req.headers.cookie);
  console.log('🔑 Session ID:', req.sessionID);
  console.log('👤 User:', (req.user as any)?.email || 'Not authenticated');
  next();
});

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
    console.log(`Trust proxy: ${app.get('trust proxy')}`);
  });
})();