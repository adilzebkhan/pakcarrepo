// 2) Backend: models/Admin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.checkPassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model("Admin", AdminSchema);
