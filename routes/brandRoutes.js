import express from "express";
import Brand from "../models/Brands.js";
const router = express.Router();
import upload from "../middleware/cloudinaryUpload.js";
//Get All Brands

router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ Error: "Failed to fetch brands" });
  }
});

// Add a new brand

//

router.post("/", upload.single("brandLogo"), async (req, res) => {
  try {
    const { brandName } = req.body;
    const brandLogo = req.file.path; // Cloudinary image URL

    const brand = new Brand({ brandName, brandLogo });
    await brand.save();

    res.status(201).json(brand);
  } catch (error) {
    console.error("Error saving brand:", error);
    res.status(500).json({ error: "Failed to create brand" });
  }
});

export default router;
