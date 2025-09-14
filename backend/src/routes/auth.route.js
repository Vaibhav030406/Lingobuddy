// vaibhav030406/lingobuddy/Lingobuddy-002ab80388e8d5a8c0d2dd48e93ec91387789a95/backend/src/routes/auth.route.js

import express from 'express';
import { signup, login, logout,onboard,updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { forgotPassword } from '../controllers/auth.controller.js';
import { verifyOtp } from '../controllers/auth.controller.js';
import { resetPassword } from '../controllers/auth.controller.js';
import passport from "passport";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post('/signup',signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password',resetPassword)

router.post('/onboarding',protectRoute,onboard);
router.put('/profile', protectRoute, updateProfile);
//check if user is logged in or not
router.get('/me',protectRoute,(req,res,next)=>{
    res.status(200).json(req.user) // Return user directly, not wrapped in success object
})

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/login", // Use CLIENT_URL
    session: true,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Redirect to frontend home after successful login
    res.redirect(process.env.CLIENT_URL); // Use CLIENT_URL
  }
);

export default router;