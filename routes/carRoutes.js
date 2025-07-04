// backend/routes/carRoutes.js
import express from "express";
import mongoose from "mongoose";

import Car from "../models/Car.js";
import auth from "../middleware/auth.js";

// ⬇️ Cloudinary-based multer storage
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ───────────── Debug: raw query ───────────── */
router.get("/raw", async (_req, res) => {
  try {
    const rawCars = await mongoose.connection.db
      .collection("cars")
      .find({})
      .toArray();
    return res.json(rawCars);
  } catch (err) {
    console.error("Raw fetch error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ───────────── Public GET routes ───────────── */
router.get("/", async (_req, res) => {
  try {
    const cars = await Car.find();
    return res.json(cars);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    return car
      ? res.json(car)
      : res.status(404).json({ message: "Car not found" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ───────────── Delete (optionally protect with auth) ───────────── */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    return res.json({ message: "Car deleted", deletedCar });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ───────────── Create – image goes to Cloudinary ───────────── */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    console.log("File middleware (POST):", req.file);
    const { brand, model, variant, price, features, popular } = req.body;

    const imageUrl = req.file?.path;

    let featureArray = [];
    if (Array.isArray(features)) {
      featureArray = features;
    } else if (features?.startsWith("[")) {
      featureArray = JSON.parse(features);
    } else if (typeof features === "string") {
      featureArray = features.split(",").map((f) => f.trim());
    }

    const newCar = new Car({
      brand,
      model,
      variant,
      price: Number(price),
      features: featureArray,
      image: imageUrl,
      popular: popular === "true" || popular === true,
    });

    const savedCar = await newCar.save();
    return res.status(201).json(savedCar);
  } catch (err) {
    console.error("Failed to add car:", err);
    return res
      .status(500)
      .json({ message: "Failed to add car", error: err.message });
  }
});

/* ───────────── Update – image goes to Cloudinary ───────────── */
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { brand, model, variant, price, features, popular } = req.body;

    let featureArray = [];
    if (Array.isArray(features)) {
      featureArray = features;
    } else if (features?.startsWith("[")) {
      featureArray = JSON.parse(features);
    } else if (typeof features === "string") {
      featureArray = features.split(",").map((f) => f.trim());
    }

    const updateFields = {
      brand,
      model,
      variant,
      price: Number(price),
      features: featureArray,
      popular: popular === "true" || popular === true,
    };

    if (req.file?.path) {
      updateFields.image = req.file.path;
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(updatedCar);
  } catch (err) {
    console.error("Failed to update car:", err);
    return res
      .status(500)
      .json({ message: "Failed to update car", error: err.message });
  }
});

export default router;
