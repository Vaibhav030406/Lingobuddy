import express from 'express';
import { signup, login, logout,onboard } from '../controllers/auth.controller.js';
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
router.post('/resetPassword',resetPassword)

router.post('/onboarding',protectRoute,onboard);

//check if user is logged in or not
router.get('/me',protectRoute,(req,res,next)=>{
    res.status(200).json({success: true, user: req.user})
})

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
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
      secure: false, // change to true in prod (HTTPS)
    });

    // Redirect to frontend home after successful login
    res.redirect("http://localhost:5173/");
  }
);

export default router;