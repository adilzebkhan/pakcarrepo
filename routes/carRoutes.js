import express from "express";
import Car from "../models/Car.js";
import path from "path";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";

// ✅ Import Cloudinary-based upload middleware
import upload from "../middleware/upload.js";

const router = express.Router();

// Raw debug route
router.get("/raw", async (req, res) => {
  try {
    const rawCars = await mongoose.connection.db
      .collection("cars")
      .find({})
      .toArray();
    console.log("Raw cars from DB:", rawCars);
    res.json(rawCars);
  } catch (err) {
    console.error("Raw fetch error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single car by ID
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: "Car not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE car by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Car deleted", deletedCar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST new car with image upload to Cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { brand, model, variant, price, features, popular } = req.body;

    const imageUrl = req.file?.path; // Cloudinary URL
    const featureArray = features.split(",").map((f) => f.trim());

    const newCar = new Car({
      brand,
      model,
      variant,
      price,
      features: featureArray,
      image: imageUrl,
      popular: popular === "true" || popular === true,
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(500).json({ message: "Failed to add car", error: err.message });
  }
});

export default router;
