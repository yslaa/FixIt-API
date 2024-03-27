const mongoose = require("mongoose");
const { RESOURCE } = require("../constants/index");

const brandSchema = new mongoose.Schema({
  brand_name: {
    type: String,
    required: [true, "Please enter a brand name"],
    maxLength: [30, "The brand name cannot exceed 30 characters"],
  },
  variant: {
    type: String,
    enum: ["Local", "International"],
    default: "Local",
  },
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
});

module.exports = mongoose.model(RESOURCE.BRAND, brandSchema);
