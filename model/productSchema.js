import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stocks: {
    type: Number,
    required: true,
  },
  Information: {
    dimension: {
      type: String,
      required: true,
    },
    variants: {
      type: [String],
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    style: {
      type: [String],
      required: true,
    },
  },
  Image: [
    {
      filename: {
        type: String,
      },
      path: {
        type: String,
        set: (value) => value.replace(/\\/g, "/"),
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PRODUCTS = mongoose.model("Products", productSchema);
export default PRODUCTS;
