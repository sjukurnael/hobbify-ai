import express from "express";
import { registerRoutes } from "./routes.js";
import cors from "cors";

const app = express();

// CORS - simpler now!
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://fastidious-begonia-48215d.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug middleware
app.use((req, res, next) => {
  console.log('📍', req.method, req.path);
  console.log('🔑 Authorization:', req.headers.authorization ? 'Present' : 'None');
  next();
});

(async () => {
  const server = await registerRoutes(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Backend URL: ${process.env.BACKEND_URL}`);
  });
})();