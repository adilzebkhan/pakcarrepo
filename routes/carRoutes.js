import express from "express";
import multer from "multer";
import Car from "../models/Car.js";
import path from "path";
import auth from "../middleware/auth.js";

import mongoose from "mongoose";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

// Add this route for debugging
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
// debug route ends here
// GET all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();
    console.log("Fetched cars:", cars); // Add this line to see in console what is wrong why you car rout does not show cars you have added in you mongodb atlas
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

// POST new car with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { brand, model, variant, price, features, popular } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;
    const featureArray = features.split(",").map((f) => f.trim());

    const newCar = new Car({
      brand,
      model,
      variant,
      price,
      features: featureArray,
      image: imagePath,
      popular: popular === "true" || popular === true, // Handle string from form
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(500).json({ message: "Failed to add car", error: err.message });
  }
});

export default router;
