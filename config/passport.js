import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import pool from '../db_config/db.js';
import { queryWithRetry } from '../db_config/queryHelper.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Google sign-in will not work.');
  console.warn('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
}

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.warn('⚠️  Facebook OAuth credentials not configured. Facebook sign-in will not work.');
  console.warn('   Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file');
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
        let result = await queryWithRetry(
          'SELECT id, email, full_name, google_id, created_at FROM users WHERE email = $1',
          [email.toLowerCase()]
        );

        let user;

        if (result.rows.length > 0) {
          // User exists - update google_id and verify email if not set
          user = result.rows[0];
          
          if (!user.google_id) {
            await queryWithRetry(
              'UPDATE users SET google_id = $1, email_verified = TRUE WHERE id = $2',
              [google_id, user.id]
            );
            user.google_id = google_id;
          } else {
            // Ensure email is verified for existing OAuth users
            await queryWithRetry(
              'UPDATE users SET email_verified = TRUE WHERE id = $1',
              [user.id]
            );
          }
        } else {
          // Create new user (no password needed for Google auth, email pre-verified)
          result = await queryWithRetry(
            'INSERT INTO users (email, full_name, google_id, password_hash, email_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, email, full_name, google_id, created_at',
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

// Configure Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'name'],
      //'email' scope requires Facebook App Review for now, we'll use facebook_id as the unique identifier
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Facebook profile
        const full_name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
        const facebook_id = profile.id;

        // generate a placeholder email using facebook_id
        // Users can update their email later if needed
        const placeholder_email = `facebook_${facebook_id}@placeholder.local`;

        // Check if user exists by facebook_id
        let result = await queryWithRetry(
          'SELECT id, email, full_name, facebook_id, created_at FROM users WHERE facebook_id = $1',
          [facebook_id]
        );

        let user;

        if (result.rows.length > 0) {
          // User exists - ensure email is verified
          user = result.rows[0];
          await queryWithRetry(
            'UPDATE users SET email_verified = TRUE WHERE id = $1',
            [user.id]
          );
        } else {
          // Create new user (no password needed for Facebook auth, email pre-verified)
          result = await queryWithRetry(
            'INSERT INTO users (email, full_name, facebook_id, password_hash, email_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, email, full_name, facebook_id, created_at',
            [placeholder_email, full_name, facebook_id, ''] // Empty password_hash for Facebook-only accounts
          );
          user = result.rows[0];
        }

        return done(null, user);
      } catch (error) {
        console.error('Facebook OAuth error:', error);
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
    const result = await queryWithRetry(
      'SELECT id, email, full_name, google_id, facebook_id, created_at FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
