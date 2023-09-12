import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImg: {
    filename: String,
    path: String,
  },
  isVerified: {
    type: String,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ADMINREGISTER = mongoose.model("AdminRegisters", AdminSchema);
export default ADMINREGISTER;
