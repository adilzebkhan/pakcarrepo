import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import carRoutes from "./routes/carRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import cors from "cors";
import authRoutes from "./middleware/auth.js";
import adminRoutes from "./routes/adminRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON
app.use(
  cors({
    origin: [
      "https://pakcarprices.vercel.app", // Deployed frontend
      "http://localhost:5173", // Local frontend
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);

// Serve static images from the /images folder
// app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/cars", carRoutes);

app.get("/", (req, res) => {
  res.send("Pak Car Prices API is running...");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const db = mongoose.connection;
    console.log("✅ Connected to DB:", db.name); // <-- print the DB name
    console.log("✅ Collections:", Object.keys(db.collections)); // <-- see what collections Mongoose see
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
