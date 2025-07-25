import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
   const { fullName, email, password } = req.body; // Changed 'username' to 'fullName'
   try {
      if (!fullName || !email || !password) { // Changed 'username' to 'fullName'
         return res.status(400).json({ message: "Please fill all the fields" });
      }
      if (password.length < 8) {
         return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         return res.status(400).json({ message: "Invalid email format" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({ message: "Email already exists" });
      }
      if (!process.env.JWT_SECRET_KEY) {
         return res.status(500).json({ message: "JWT secret key is not defined" });
      }
      const idx = Math.floor(Math.random() * 100) + 1;
      const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
      const newUser = await User.create({
         fullName, // Changed 'username' to 'fullName'
         email,
         password,
         profilePicture: randomAvatar,
      });
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
         expiresIn: '7d'
      });
      res.cookie("jwt", token, {
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
         httpOnly: true, // prevents client-side access
         sameSite: "strict", // helps prevent CSRF attacks
         secure: process.env.NODE_ENV === "production", // use secure cookies in production
      });
      res.status(201).json({ success: true, message: "User created successfully", user: newUser });
   } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
   }
};

export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      if (!email || !password) {
         return res.status(400).json({ message: "Please fill all the fields" });
      }
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(400).json({ message: "Invalid email or password" });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
         return res.status(400).json({ message: "Invalid email or password" });
      }
      if (!process.env.JWT_SECRET_KEY) {
         return res.status(500).json({ message: "JWT secret key is not defined" });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
         expiresIn: '7d'
      });
      res.cookie("jwt", token, {
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
         httpOnly: true, // prevents client-side access
         sameSite: "strict", // helps prevent CSRF attacks
         secure: process.env.NODE_ENV === "production", // use secure cookies in production
      });
      res.status(201).json({ success: true, message: "User logged in successfully", user }); // Changed message
   } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
   }
};

export const logout = async (req, res) => {
   res.clearCookie("jwt");
   res.status(200).json({ success: true, message: "User logged out successfully" });
};