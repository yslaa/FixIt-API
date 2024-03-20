const Delivery = require("../models/delivery");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const { STATUSCODE, RESOURCE } = require("../constants/index");

exports.getAllDeliveryData = async () => {
  const deliverys = await Delivery.find()
    .sort({
      createdAt: STATUSCODE.NEGATIVE_ONE,
    })
    .populate({
      path: RESOURCE.PRODUCT,
      select: "product_name",
    })
    .lean()
    .exec();

  return deliverys;
};

exports.getSingleDeliveryData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid delivery ID: ${id}`);
  }

  const delivery = await Delivery.findById(id)
    .populate({
      path: RESOURCE.PRODUCT,
      select: "product_name",
    })
    .lean()
    .exec();

  if (!delivery) {
    throw new ErrorHandler(`Delivery not found with ID: ${id}`);
  }

  return delivery;
};

exports.createDeliveryData = async (req, res) => {
  const duplicateDelivery = await Delivery.findOne({
    delivery: req.body.company_name,
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateDelivery) {
    throw new ErrorHandler("Duplicate company name");
  }

  const delivery = await Delivery.create(req.body);

  await Delivery.populate(delivery, {
    path: RESOURCE.PRODUCT,
    select: "product_name",
  });

  return delivery;
};

exports.updateDeliveryData = async (req, res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid delivery ID: ${id}`);

  const existingDelivery = await Delivery.findById(id).lean().exec();

  if (!existingDelivery)
    throw new ErrorHandler(`Delivery not found with ID: ${id}`);

  const duplicateDelivery = await Delivery.findOne({
    name: req.body.company_name,
    _id: {
      $ne: id,
    },
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateDelivery) throw new ErrorHandler("Duplicate company name");

  const updatedDelivery = await Delivery.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate({
      path: RESOURCE.PRODUCT,
      select: "product_name",
    })
    .lean()
    .exec();

  if (!updatedDelivery)
    throw new ErrorHandler(`Delivery not found with ID: ${id}`);

  return updatedDelivery;
};

exports.deleteDeliveryData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid delivery ID ${id}`);
  }

  const delivery = await Delivery.findOne({
    _id: id,
  });
  if (!delivery) throw new ErrorHandler(`Delivery not found with ID: ${id}`);

  await Promise.all([
    Delivery.deleteOne({
      _id: id,
    })
      .lean()
      .exec(),
  ]);

  return delivery;
};
