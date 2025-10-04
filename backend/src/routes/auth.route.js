import express from 'express';
import { signup, login, logout, onboard, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { forgotPassword } from '../controllers/auth.controller.js';
import { verifyOtp } from '../controllers/auth.controller.js';
import { resetPassword } from '../controllers/auth.controller.js';
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.post('/onboarding', protectRoute, onboard);
router.put('/profile', protectRoute, updateProfile);

// Check if user is logged in or not
router.get('/me', protectRoute, (req, res, next) => {
    res.status(200).json(req.user);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/login",
    session: true,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Set cookie with proper configuration
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });

    // ✅ CRITICAL FIX: Pass token in URL as fallback since cookies may not work immediately
    const redirectUrl = user.isOnboarded
      ? `${process.env.CLIENT_URL}/?authSuccess=true&token=${token}`
      : `${process.env.CLIENT_URL}/onboarding?authSuccess=true&token=${token}`;

    res.redirect(redirectUrl);
  }
);

// Test endpoint to verify cookie setting
router.get('/test-cookie', (req, res) => {
    const testToken = 'test-token-12345';
    
    res.cookie('test-jwt', testToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
    });
    
    res.json({
        success: true,
        message: 'Test cookie set',
        cookieConfig: {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        },
        headers: res.getHeaders(),
    });
});

// Test endpoint to verify cookie reading
router.get('/verify-cookie', (req, res) => {
    const cookies = req.cookies;
    
    res.json({
        success: true,
        message: 'Cookie check',
        hasCookie: !!cookies.jwt,
        hasTestCookie: !!cookies['test-jwt'],
        allCookies: Object.keys(cookies),
    });
});

export default router;