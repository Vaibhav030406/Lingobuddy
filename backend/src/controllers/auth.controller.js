import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js"

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
   const firstInitial = fullName.trim().charAt(0).toUpperCase();
    
      const randomAvatar = `https://avatar.iran.liara.run/username?username=${firstInitial}`;
      const newUser = await User.create({
         fullName, // Changed 'username' to 'fullName'
         email,
         password,
         profilePicture: randomAvatar,
      });

      try{
        await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePicture || "",
        });
        console.log(`Stream user created for ${newUser.fullName}`);
      }
        catch(error){
        console.error("Error upserting Stream user:", error);
        }
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
         expiresIn: '7d'
      });
      res.cookie("jwt", token, {
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
         httpOnly: true, // prevents client-side access
         sameSite: "none", // helps prevent CSRF attacks
         secure: process.env.NODE_ENV === "production", // use secure cookies in production
      });
      res.status(201).json({ success: true, message: "User created successfully", user: newUser });
   } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
   }
};

// In backend/src/controllers/auth.controller.js
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
         httpOnly: true,
         sameSite: "none",
         secure: process.env.NODE_ENV === "production",
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json({ success: true, message: "User logged in successfully", user: userResponse });
   } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
   }
};export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // 🔥 Send the OTP via email
    await sendEmail(email, "LingoBuddy OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Optional: Clear OTP after success (to prevent reuse)
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Email, password and confirm password are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password; // Will be hashed if you use a pre-save hook
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
   res.clearCookie("jwt");
   res.status(200).json({ success: true, message: "User logged out successfully" });
};
export const onboard = async (req, res) => {
    try{
        const userId = req.user._id;
        const {fullName,bio,nativeLanguage,learningLanguage,location,profilePicture} = req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({message: "Please fill all the fields"})
        }
        const updatedUser = await User.findByIdAndUpdate(userId, {
        ...req.body,
        isOnboarded: true
    }, { new: true });
        if(!updatedUser){
            return res.status(404).json({message: "User not found"})
        }
        try{
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePicture || "",
            })
            console.log(`Stream user upserted for ${updatedUser.fullName}`);
        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }
        res.status(200).json({success: true, message: "User onboarded successfully", user: updatedUser});
    } catch (error) {
        console.error("Error during onboarding:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location, profilePicture } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePicture || "",
            });
            console.log(`Stream user upserted for ${updatedUser.fullName}`);
        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error during profile update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};