import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage.js';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails![0].value;
      
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        let role: 'admin' | 'instructor' | 'member' = 'member';
        
        if (ADMIN_EMAILS.includes(email)) {
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
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

export default passport;