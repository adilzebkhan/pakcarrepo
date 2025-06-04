// backend/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import Admin from "../models/Admin.js";
const router = express.Router();

// Protected admin dashboard route
router.get("/dashboard", auth, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

// 🔁 Seed admin user or update password if already exists
router.get("/seed", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log(hashedPassword);
    const admin = await Admin.findOneAndUpdate(
      { username: "admin" },
      { password: hashedPassword },
      { new: true, upsert: true } // create if not exists
    );

    const message = admin.createdAt
      ? "Admin user created"
      : "Admin password updated";
    res.status(201).json({ message, admin });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to seed admin", error: err.message });
  }
});

// 🔐 Admin login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Username received:", username);
    console.log("Password received:", password);

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log("Admin not found in DB");
      return res.status(401).json({ message: "Invalid username or password" });
    }
    console.log("🟢 Fetched from DB:", {
      username: admin.username,
      passwordHash: admin.password, // Hashed password from DB
    });
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password not matched");
      return res.status(401).json({
        message: "Invalid username or password or password not matched",
      });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    console.log("✅ Login success, sending token.");

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

export default router;
