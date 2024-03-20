const SuccessHandler = require("../utils/successHandler");
const ErrorHandler = require("../utils/errorHandler");
const deliverysService = require("../services/deliveryService");
const asyncHandler = require("express-async-handler");
const checkRequiredFields = require("../helpers/checkRequiredFields");
const { STATUSCODE } = require("../constants/index");

exports.getAllDeliverys = asyncHandler(async (req, res, next) => {
  const deliverys = await deliverysService.getAllDeliveryData();

  return deliverys?.length === STATUSCODE.ZERO
    ? next(new ErrorHandler("No deliverys found"))
    : SuccessHandler(
        res,
        `Deliverys with delivery ${deliverys
          .map((p) => p?.company_name)
          .join(", ")} and IDs ${deliverys
          .map((p) => p?._id)
          .join(", ")} retrieved`,
        deliverys
      );
});

exports.getSingleDelivery = asyncHandler(async (req, res, next) => {
  const delivery = await deliverysService.getSingleDeliveryData(req.params?.id);

  return !delivery
    ? next(new ErrorHandler("No delivery found"))
    : SuccessHandler(
        res,
        `Delivery ${delivery?.company_name} with ID ${delivery?._id} retrieved`,
        delivery
      );
});

exports.createNewDelivery = [
  checkRequiredFields(["company_name", "date", "price", "quantity"]),
  asyncHandler(async (req, res, next) => {
    const delivery = await deliverysService.createDeliveryData(req);

    return SuccessHandler(
      res,
      `Created new Delivery ${delivery?.company_name} with an ID ${delivery?._id}`,
      delivery
    );
  }),
];

exports.updateDelivery = [
  checkRequiredFields(["company_name", "date", "price", "quantity"]),
  asyncHandler(async (req, res, next) => {
    const delivery = await deliverysService.updateDeliveryData(
      req,
      res,
      req.params.id
    );

    return SuccessHandler(
      res,
      `Delivery ${delivery?.company_name} with ID ${delivery?._id} is updated`,
      delivery
    );
  }),
];

exports.deleteDelivery = asyncHandler(async (req, res, next) => {
  const delivery = await deliverysService.deleteDeliveryData(req.params.id);

  return !delivery
    ? next(new ErrorHandler("No delivery found"))
    : SuccessHandler(
        res,
        `Delivery ${delivery?.company_name} with ID ${delivery?._id} is deleted`,
        delivery
      );
});
