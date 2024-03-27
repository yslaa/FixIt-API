const SuccessHandler = require("../utils/successHandler");
const ErrorHandler = require("../utils/errorHandler");
const brandsService = require("../services/brandsService");
const asyncHandler = require("express-async-handler");
const checkRequiredFields = require("../helpers/checkRequiredFields");
const { STATUSCODE } = require("../constants/index");
const { upload } = require("../utils/cloudinary");

exports.getAllBrands = asyncHandler(async (req, res, next) => {
  const brands = await brandsService.getAllBrandData();

  return brands?.length === STATUSCODE.ZERO
    ? next(new ErrorHandler("No brands found"))
    : SuccessHandler(
        res,
        `Brands with brand ${brands
          .map((p) => p?.brand_name)
          .join(", ")} and IDs ${brands
          .map((p) => p?._id)
          .join(", ")} retrieved`,
        brands
      );
});

exports.getSingleBrand = asyncHandler(async (req, res, next) => {
  const brand = await brandsService.getSingleBrandData(req.params?.id);

  return !brand
    ? next(new ErrorHandler("No brand found"))
    : SuccessHandler(
        res,
        `Brand ${brand?.brand_name} with ID ${brand?._id} retrieved`,
        brand
      );
});

exports.createNewBrand = [
  upload.array("image"),
  checkRequiredFields(["brand_name", "variant", "image"]),
  asyncHandler(async (req, res, next) => {
    const brand = await brandsService.createBrandData(req);

    return SuccessHandler(
      res,
      `Created new Brand ${brand?.brand_name} with an ID ${brand?._id}`,
      brand
    );
  }),
];

exports.updateBrand = [
  upload.array("image"),
  checkRequiredFields(["brand_name", "variant", "image"]),
  asyncHandler(async (req, res, next) => {
    const brand = await brandsService.updateBrandData(
      req,
      res,
      req.params.id
    );

    return SuccessHandler(
      res,
      `Brand ${brand?.brand_name} with ID ${brand?._id} is updated`,
      brand
    );
  }),
];

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await brandsService.deleteBrandData(req.params.id);

  return !brand
    ? next(new ErrorHandler("No brand found"))
    : SuccessHandler(
        res,
        `Brand ${brand?.brand_name} with ID ${brand?._id} is deleted`,
        brand
      );
});
