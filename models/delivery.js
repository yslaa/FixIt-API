const mongoose = require("mongoose");
const { RESOURCE } = require("../constants/index");

const deliverySchema = new mongoose.Schema({
  product: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please enter a product"],
      ref: RESOURCE.PRODUCT,
    },
  ],
  company_name: {
    type: String,
    required: [true, "Please enter a delivery name"],
    maxLength: [30, "The delivery name cannot exceed 30 characters"],
  },
  date: {
    type: Date,
    required: [true, "Please enter a date of your delivery"],
  },
  price: {
    type: Number,
    required: [true, "Please enter a price"],
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  quantity: {
    type: Number,
    required: [true, "Please enter a quantity"],
  },
});

module.exports = mongoose.model(RESOURCE.DELIVERY, deliverySchema);
