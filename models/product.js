const mongoose = require("mongoose");
const {
  RESOURCE
} = require("../constants/index");

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: [true, "Please enter a product name"],
    maxLength: [30, "The product name cannot exceed 30 characters"],
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please enter a brand"],
    ref: RESOURCE.BRAND,
  },
  type: {
    type: String,
    enum: ["Door Accessories", "Machinery Equipment", "Hand Tools", "Safety and Security", "Power Tools", "Painting", "Electrical", "Lighting", "Building Materials"],
  },
  price: {
    type: Number,
    required: [true, "Please enter a price"],
  },
  stock: [{
    type: Number,
    required: [true, "Stocks field required"],
    min: [1, "Stocks field must be at least 1"],
  }, ],
  image: [{
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
    },
  }, ],
  wishlist: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: RESOURCE.USER,
      },
    },
  ],
});

module.exports = mongoose.model(RESOURCE.PRODUCT, productSchema);