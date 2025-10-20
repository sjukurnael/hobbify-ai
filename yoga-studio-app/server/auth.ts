import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage.js';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails![0].value;
      const intendedRole = req.query.state as string; // 'customer' or 'studio-owner'
      
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Determine role based on intended role and whitelist
        let role: 'admin' | 'instructor' | 'member' = 'member';
        
        if (intendedRole === 'studio-owner' && ADMIN_EMAILS.includes(email)) {
          role = 'admin';
        }
        
        user = await storage.createUser({
          email: email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          passwordHash: 'google-oauth',
          role: role
        });
      }
      
      // Store intended role in session for redirect logic
      (req as any).session.intendedRole = intendedRole;
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;