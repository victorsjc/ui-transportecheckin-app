import express from 'express';
import session from 'express-session';
import passport from 'passport';
import memorystore from 'memorystore';
import cors from 'cors';
import { setupAuth } from './server/auth.ts';
import { registerRoutes } from './server/routes.ts';

const MemoryStore = memorystore(session);

// Initialize Express app
const app = express();
app.use(express.json());

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};
app.use(cors(corsConfig));

// Setup session (with memory store for serverless environment)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Setup authentication routes
setupAuth(app);

// Register all other API routes
registerRoutes(app);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro no servidor' });
});

// Export for Vercel serverless function
export default app;
