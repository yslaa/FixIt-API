const Product = require("../models/product");
const Transaction = require("../models/transaction");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const { cloudinary } = require("../utils/cloudinary");
const { STATUSCODE, RESOURCE } = require("../constants/index");

exports.getAllProductData = async () => {
  const products = await Product.find()
    .sort({
      createdAt: STATUSCODE.NEGATIVE_ONE,
    })
    .lean()
    .exec();

  return products;
};

exports.getSingleProductData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid product ID: ${id}`);
  }

  const product = await Product.findById(id)
    .lean()
    .exec();

  if (!product) {
    throw new ErrorHandler(`Product not found with ID: ${id}`);
  }

  return product;
};

exports.createProductData = async (req, res) => {
  const duplicateProduct = await Product.findOne({
    product: req.body.product_name,
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateProduct) {
    throw new ErrorHandler("Duplicate product name");
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
           url: result.secure_url,
          originalname: file.originalname,
        };
      })
    );
  }

  if (image.length === STATUSCODE.ZERO)
    throw new ErrorHandler("At least one image is required");

  const product = await Product.create({
    ...req.body,
    image: image,
  });

  return product;
};

exports.updateProductData = async (req, res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid product ID: ${id}`);

  const existingProduct = await Product.findById(id).lean().exec();

  if (!existingProduct)
    throw new ErrorHandler(`Product not found with ID: ${id}`);

  const duplicateProduct = await Product.findOne({
    name: req.body.product_name,
    _id: {
      $ne: id,
    },
  })
    .collation({
      locale: "en",
    })
    .lean()
    .exec();

  if (duplicateProduct) throw new ErrorHandler("Duplicate product name");

  let image = existingProduct.image || [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    image = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          public_id: file.filename,
        });
        return {
          public_id: result.public_id,
           url: result.secure_url,
          originalname: file.originalname,
        };
      })
    );

    await cloudinary.api.delete_resources(
      existingProduct.image.map((image) => image.public_id)
    );
  }
  const updatedProduct = await Product.findByIdAndUpdate(
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

  if (!updatedProduct)
    throw new ErrorHandler(`Product not found with ID: ${id}`);

  return updatedProduct;
};

exports.deleteProductData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid product ID ${id}`);
  }

  const product = await Product.findOne({
    _id: id,
  });
  if (!product) throw new ErrorHandler(`Product not found with ID: ${id}`);

  const publicIds = product.image.map((image) => image.public_id);

  await Promise.all([
    Product.deleteOne({
      _id: id,
    })
      .lean()
      .exec(),
    cloudinary.api.delete_resources(publicIds),
    Transaction.deleteMany({
      product: id,
    })
      .lean()
      .exec(),
  ]);
  return product;
};

exports.createWishlistData = async (userId, id) => {
  const product = await Product.findById(id);

  // Check if the product exists
  if (!product) {
    throw new ErrorHandler("Product not found");
  }


  if (!product.wishlist) {
    product.wishlist = [];
  }


  const isUserInWishlist = product.wishlist.some(wish => wish.user.toString() === userId.toString());

  if (isUserInWishlist) {
    throw new ErrorHandler("User already exists in the wishlist");
  }


  product.wishlist.push({user: userId});
  await product.save();

  await product.populate({
    path: 'wishlist.user',
    select: 'name',
  });

}



exports.deleteWishlistData = async (userId, id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorHandler("Product not found");
  }
  const wishlistIndex = product.wishlist.findIndex(wish => wish.user.toString() === userId.toString());

  if (wishlistIndex === -1) {
    throw new ErrorHandler(`Wishlist not found with ID: ${product}`);
  }


  product.wishlist.splice(wishlistIndex, 1);
  await product.save();

  await product.populate({
    path: 'wishlist.user',
    select: 'name',
  });
};
