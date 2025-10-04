import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
   try {
      let token;
      
      // Check for token in cookie first
      token = req.cookies.jwt;
      
      // 🎯 NEW: If no cookie, check Authorization header
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
         token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
         return res.status(401).json({ message: "Unauthorized - No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
         return res.status(401).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
   } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
   }
};