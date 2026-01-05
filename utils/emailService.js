import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'LocalBite <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send email verification link to new users
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Resend API response
 */
export async function sendVerificationEmail(email, token) {
  const verificationLink = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - LocalBite Kitchen',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🍴 LocalBite</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
              
              <p style="font-size: 16px; color: #666;">
                Thank you for signing up! Please verify your email address to complete your registration and access all features.
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationLink}" 
                   style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #f97316; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 13px; color: #999; margin-bottom: 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} LocalBite. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Verification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send welcome email to new users
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} Resend API response
 */
export async function sendWelcomeEmail(email, fullName) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to LocalBite!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🍴 LocalBite</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome${fullName ? `, ${fullName}` : ''}! 👋</h2>
              
              <p style="font-size: 16px; color: #666;">
                We're excited to have you join the LocalBite community! Discover and share amazing recipes from around the world.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Get Started:</h3>
                <ul style="color: #666; padding-left: 20px;">
                  <li>Browse our collection of delicious recipes</li>
                  <li>Save your favorite recipes</li>
                  <li>Share your own culinary creations</li>
                  <li>Join our cooking community</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${FRONTEND_URL}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);">
                  Start Exploring
                </a>
              </div>
              
              <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
                Happy cooking!
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} LocalBite. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}
