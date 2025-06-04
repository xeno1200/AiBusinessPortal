import express, { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { storage } from './storage';
import MemoryStore from 'memorystore';
import { User } from '@shared/schema';

// Set up express-session with MemoryStore for development
const SessionStore = MemoryStore(session);

export function configureAuth(app: express.Express): void {
  // Configure sessions
  app.use(
    session({
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      secret: process.env.SESSION_SECRET || 'talqio-cms-secret',
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Initialize passport and session support
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);

        // User not found
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect username or password' });
        }

        // Success
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to store in session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register auth routes
  const authRouter = express.Router();

  // Login route
  authRouter.post('/login', passport.authenticate('local'), (req: Request, res: Response) => {
    // Strip password from user object
    const user = req.user as User;
    const { password, ...safeUser } = user;
    res.json({ user: safeUser, success: true });
  });

  // Logout route
  authRouter.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ success: true });
    });
  });

  // Register route
  authRouter.post('/register', async (req: Request, res: Response) => {
    try {
      const { fullName, username, email, password } = req.body;

      // Validate required fields
      if (!fullName || !username || !email || !password) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username).catch(() => null);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username already exists' 
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email).catch(() => null);
      if (existingEmail) {
        return res.status(400).json({ 
          message: 'Email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        fullName,
        username,
        email,
        password: hashedPassword,
        isAdmin: false
      });

      // Strip password from response
      const { password: _, ...safeUser } = newUser;
      
      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        user: safeUser
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Internal server error during registration' 
      });
    }
  });

  // Check if user is authenticated
  authRouter.get('/me', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ authenticated: false });
    }

    // Strip password from user object
    const user = req.user as User;
    const { password, ...safeUser } = user;
    
    res.json({
      authenticated: true,
      user: safeUser
    });
  });

  // Register auth routes
  app.use('/api/auth', authRouter);
}

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to require admin privileges
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = req.user as User;
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};