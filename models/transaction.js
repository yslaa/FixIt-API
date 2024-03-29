const mongoose = require("mongoose");
const { RESOURCE } = require("../constants/index");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please enter a user"],
    ref: RESOURCE.USER,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  dateOrdered: {
    type: Date,
    default: Date.now()
  },
  payment: {
    type: Object,
    properties: {
        value: {
            type: String,
            enum: ["Cash on Delivery", "Bank Transfer", "Card Payment"]
        },
        card: {
            type: String
        }
    }
  },
  shippingInfo: {
    address1: {
        type: String,
        required: true
    },
    address2: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  orderItems: [
      {
          product_name: {
            type: String,
            required: true
          },
          brand: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: RESOURCE.BRAND,
          },
          productType: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          image: [
            {
              type: String,
              required: true
            }
          ],
          price: {
            type: Number,
            required: true
          },
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Please enter a product"],
            ref: RESOURCE.PRODUCT,
          },
      }
  ],
  itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
  },
  shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
  },
  totalPrice: {
      type: Number,
      required: true,
      default: 0.0
  },
  deliveredAt: {
      type: Date
  },
});

module.exports = mongoose.model(RESOURCE.TRANSACTION, transactionSchema);
