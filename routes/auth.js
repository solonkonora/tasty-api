import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db_config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import passport from '../config/passport.js';
import { sendWelcomeEmail, sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();
const SALT_ROUNDS = 10;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;


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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create user with verification token
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, email_verified, verification_token, verification_token_expires) 
       VALUES ($1, $2, $3, FALSE, $4, $5) 
       RETURNING id, email, full_name, created_at, email_verified`,
      [email.toLowerCase(), password_hash, full_name || null, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created, they can request new verification email
    }

    // DO NOT generate JWT or log user in
    // They must verify email first
    res.status(201).json({
      message: 'Account created successfully! Please check your email to verify your account.',
      email: user.email,
      emailVerified: false
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
      'SELECT id, email, password_hash, full_name, created_at, email_verified FROM users WHERE email = $1',
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

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailVerified: false,
        email: user.email
      });
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

  // Get current authenticated user
 
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, created_at, email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

/**
 * Verify email address using token from email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with this verification token
    const result = await pool.query(
      'SELECT id, email, full_name, email_verified, verification_token_expires FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        error: 'Email already verified. You can now log in.',
        alreadyVerified: true
      });
    }

    // Check if token has expired
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ 
        error: 'Verification link has expired. Please request a new one.',
        expired: true,
        email: user.email
      });
    }

    // Mark email as verified and clear verification token
    await pool.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.full_name).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    // Generate JWT and log user in automatically after verification
    const jwtToken = generateToken(user.id, user.email);

    // Set httpOnly cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Email verified successfully! You are now logged in.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

/**
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not (security)
      return res.json({ message: 'If an account exists with that email, a verification link has been sent.' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        error: 'Email is already verified. You can log in now.',
        alreadyVerified: true
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    // Update user with new token
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, verificationExpires, user.id]
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

//  Initiates Google OAuth flow
//  Frontend redirects to this endpoint

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

//  Initiates Facebook OAuth flow
//  Frontend redirects to this endpoint
 
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
