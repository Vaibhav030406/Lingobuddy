import express from "express";
import {
  signup,
  login,
  logout,
  onboard,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ------------------------------------------------------
   🧠 1. BASIC AUTH ROUTES
------------------------------------------------------ */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.post("/onboarding", protectRoute, onboard);
router.put("/profile", protectRoute, updateProfile);

/* ------------------------------------------------------
   🔐 2. GET CURRENT USER
------------------------------------------------------ */
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json(req.user); // Directly return user
});

/* ------------------------------------------------------
   🌐 3. GOOGLE AUTH ROUTES
------------------------------------------------------ */
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

    // ✅ Sign new JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true, // Always secure (Vercel uses HTTPS)
      path: "/",
    });

    /* ------------------------------------------------------
       ✅ REDIRECT FLOW (MOST STABLE FOR NETLIFY ↔ VERCEL)
       1️⃣ Redirect to /auth/loading first → gives browser time
       2️⃣ /auth/loading page on frontend refetches /auth/me
       3️⃣ Then routes user → "/" or "/onboarding"
    ------------------------------------------------------ */
    const redirectUrl =
      process.env.CLIENT_URL +
      `/auth/loading?onboarded=${user.isOnboarded ? "1" : "0"}`;

    console.log("🔁 Google login success → redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

/* ------------------------------------------------------
   🧪 4. TEST ROUTES (OPTIONAL, KEEP FOR DEBUG)
------------------------------------------------------ */
router.get("/test-cookie", (req, res) => {
  const testToken = "test-token-12345";

  res.cookie("test-jwt", testToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({
    success: true,
    message: "Test cookie set successfully",
    cookieConfig: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    },
  });
});

router.get("/verify-cookie", (req, res) => {
  const cookies = req.cookies;

  res.json({
    success: true,
    message: "Cookie check",
    hasCookie: !!cookies.jwt,
    hasTestCookie: !!cookies["test-jwt"],
    allCookies: Object.keys(cookies),
  });
});

export default router;
