import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    brand: String,
    model: String,
    variant: String,
    price: Number,
    image: String,
    features: [String],
    popular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

export default Car;
