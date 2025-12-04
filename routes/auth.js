import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db_config/db.js';
import { generateToken } from '../middleware/auth.js';
import passport from '../config/passport.js';
import { sendMagicLinkEmail, sendWelcomeEmail } from '../utils/emailService.js';

const router = express.Router();
const SALT_ROUNDS = 10;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MAGIC_LINK_EXPIRY_MINUTES = 15;


router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
      [email.toLowerCase(), password_hash, full_name || null]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Set httpOnly cookie (more secure)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      },
      token // Also return token for clients that prefer header-based auth
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ========================================
// Magic Link Authentication
// ========================================

/**
 * Request a magic link to be sent to user's email
 * No password needed - just email
 */
router.post('/request-magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, full_name FROM users WHERE email = $1',
      [normalizedEmail]
    );

    const isNewUser = userResult.rows.length === 0;

    // Store magic link token
    await pool.query(
      'INSERT INTO magic_links (email, token, expires_at) VALUES ($1, $2, $3)',
      [normalizedEmail, token, expiresAt]
    );

    // Send magic link email
    await sendMagicLinkEmail(normalizedEmail, token);

    // Don't reveal if user exists or not (security)
    res.json({ 
      message: 'Magic link sent! Check your email to sign in.',
      isNewUser // Optional: can be used to show different UI
    });
  } catch (error) {
    console.error('Request magic link error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
});

/**
 * Verify magic link token and log user in
 * Creates new user if they don't exist
 */
router.post('/verify-magic-link', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find valid magic link
    const linkResult = await pool.query(
      'SELECT email, expires_at, used FROM magic_links WHERE token = $1',
      [token]
    );

    if (linkResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired magic link' });
    }

    const magicLink = linkResult.rows[0];

    // Check if already used
    if (magicLink.used) {
      return res.status(401).json({ error: 'This magic link has already been used' });
    }

    // Check if expired
    if (new Date(magicLink.expires_at) < new Date()) {
      return res.status(401).json({ error: 'This magic link has expired' });
    }

    // Mark magic link as used
    await pool.query(
      'UPDATE magic_links SET used = TRUE WHERE token = $1',
      [token]
    );

    // Check if user exists
    let userResult = await pool.query(
      'SELECT id, email, full_name, created_at FROM users WHERE email = $1',
      [magicLink.email]
    );

    let user;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      // Create new user (passwordless)
      const newUserResult = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, NULL) RETURNING id, email, full_name, created_at',
        [magicLink.email]
      );
      user = newUserResult.rows[0];
      isNewUser = true;

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.full_name).catch(err => 
        console.error('Failed to send welcome email:', err)
      );
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT
    const jwtToken = generateToken(user.id, user.email);

    // Set httpOnly cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: isNewUser ? 'Account created and logged in successfully!' : 'Logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      },
      token: jwtToken,
      isNewUser
    });
  } catch (error) {
    console.error('Verify magic link error:', error);
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
});


router.get('/me', async (req, res) => {
  try {
    // Extract token from cookie or header
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token (using the auth middleware logic inline)
    const jwt = (await import('jsonwebtoken')).default;
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from database
    const result = await pool.query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ========================================
// Google OAuth Routes
// ========================================

/**
 * Initiates Google OAuth flow
 * Frontend redirects to this endpoint
 */
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false // We use JWT, not sessions
  })
);

/**
 * Google OAuth callback
 * Google redirects here after user authorizes
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      // User authenticated successfully via passport
      const user = req.user;

      // Generate JWT token (same as email/password login)
      const token = generateToken(user.id, user.email);

      // Set httpOnly cookie (works for same-origin)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Also pass token in URL for cross-origin scenarios
      // Frontend can extract and store it
      res.redirect(`${FRONTEND_URL}/?auth=success&token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// ========================================
// Facebook OAuth Routes
// ========================================

/**
 * Initiates Facebook OAuth flow
 * Frontend redirects to this endpoint
 */
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['public_profile'], // Only request public_profile (no email required)
    session: false // We use JWT, not sessions
  })
);

/**
 * Facebook OAuth callback
 * Facebook redirects here after user authorizes
 */
router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=facebook_auth_failed`
  }),
  (req, res) => {
    try {
      // User authenticated successfully via passport
      const user = req.user;

      // Generate JWT token (same as email/password login)
      const token = generateToken(user.id, user.email);

      // Set httpOnly cookie (works for same-origin)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Also pass token in URL for cross-origin scenarios
      // Frontend can extract and store it
      res.redirect(`${FRONTEND_URL}/?auth=success&token=${token}`);
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

export default router;
