// backend/middleware/cloudinaryUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pakcar", // name of folder in Cloudinary
    allowedformats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

export default upload;
