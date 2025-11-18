import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db_config/db.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Google sign-in will not work.');
  console.warn('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
}

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails[0].value;
        const full_name = profile.displayName;
        const google_id = profile.id;

        // Check if user exists
        let result = await pool.query(
          'SELECT id, email, full_name, google_id, created_at FROM users WHERE email = $1',
          [email.toLowerCase()]
        );

        let user;

        if (result.rows.length > 0) {
          // User exists - update google_id if not set
          user = result.rows[0];
          
          if (!user.google_id) {
            await pool.query(
              'UPDATE users SET google_id = $1 WHERE id = $2',
              [google_id, user.id]
            );
            user.google_id = google_id;
          }
        } else {
          // Create new user (no password needed for Google auth)
          result = await pool.query(
            'INSERT INTO users (email, full_name, google_id, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, google_id, created_at',
            [email.toLowerCase(), full_name, google_id, ''] // Empty password_hash for Google-only accounts
          );
          user = result.rows[0];
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user to session (we won't use sessions, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, google_id, created_at FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
