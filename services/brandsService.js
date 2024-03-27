const Brand = require("../models/brand");
const Product = require("../models/product");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const { cloudinary } = require("../utils/cloudinary");
const { STATUSCODE, RESOURCE } = require("../constants/index");

exports.getAllBrandData = async () => {
  const brands = await Brand.find()
    .sort({
      createdAt: STATUSCODE.NEGATIVE_ONE,
    })
    .lean()
    .exec();

  return brands;
};

exports.getSingleBrandData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid brand ID: ${id}`);
  }

  const brand = await Brand.findById(id)
    .lean()
    .exec();

  if (!brand) {
    throw new ErrorHandler(`Brand not found with ID: ${id}`);
  }

  return brand;
};

exports.createBrandData = async (req, res) => {
  const duplicateBrand = await Brand.findOne({
    brand: req.body.brand_name,
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateBrand) {
    throw new ErrorHandler("Duplicate brand name");
  }

  let image = [];
  if (req.files && Array.isArray(req.files)) {
    image = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          public_id: file.filename,
        });
        return {
          public_id: result.public_id,
          url: result.url,
          originalname: file.originalname,
        };
      })
    );
  }

  if (image.length === STATUSCODE.ZERO)
    throw new ErrorHandler("At least one image is required");

  const brand = await Brand.create({
    ...req.body,
    image: image,
  });

  return brand;
};

exports.updateBrandData = async (req, res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid brand ID: ${id}`);

  const existingBrand = await Brand.findById(id).lean().exec();

  if (!existingBrand)
    throw new ErrorHandler(`Brand not found with ID: ${id}`);

  const duplicateBrand = await Brand.findOne({
    name: req.body.brand_name,
    _id: {
      $ne: id,
    },
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateBrand) throw new ErrorHandler("Duplicate brand name");

  let image = existingBrand.image || [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    image = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          public_id: file.filename,
        });
        return {
          public_id: result.public_id,
          url: result.url,
          originalname: file.originalname,
        };
      })
    );

    await cloudinary.api.delete_resources(
      existingBrand.image.map((image) => image.public_id)
    );
  }
  const updatedBrand = await Brand.findByIdAndUpdate(
    id,
    {
      ...req.body,
      image: image,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .lean()
    .exec();

  if (!updatedBrand)
    throw new ErrorHandler(`Brand not found with ID: ${id}`);

  return updatedBrand;
};

exports.deleteBrandData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid brand ID ${id}`);
  }

  const brand = await Brand.findOne({
    _id: id,
  });
  if (!brand) throw new ErrorHandler(`Brand not found with ID: ${id}`);

  const publicIds = brand.image.map((image) => image.public_id);

  await Promise.all([
    Brand.deleteOne({
      _id: id,
    })
      .lean()
      .exec(),
    cloudinary.api.delete_resources(publicIds),
    Product.deleteMany({
      brand: id,
    })
      .lean()
      .exec(),
  ]);
  return brand;
};
