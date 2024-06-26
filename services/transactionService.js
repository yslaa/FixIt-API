const Transaction = require("../models/transaction");
const Product = require("../models/product");
const User = require("../models/user");
const Comment = require("../models/comment");
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { STATUSCODE, RESOURCE } = require("../constants/index");
const { sendEmail } = require("../utils/sendEmail");

exports.getAllTransactionData = async () => {
  const transactions = await Transaction.find()
    .sort({
      createdAt: STATUSCODE.NEGATIVE_ONE,
    })
    .lean()
    .exec();

  return transactions;
};

exports.getSingleTransactionData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const transaction = await Transaction.findById(id).lean().exec();

  if (!transaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  return transaction;
};

exports.createTransactionData = async (data) => {
  const {
    user,
    status,
    dateOrdered,
    payment,
    shippingInfo,
    orderItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = data;

  const users = await User.findById(user).select("email");

  const transaction = await Transaction.create({
    user,
    status,
    dateOrdered,
    payment,
    shippingInfo,
    orderItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  console.log(transaction);

  await Transaction.populate(transaction, [
    {
      path: RESOURCE.USER,
      select: "name email",
    },
    {
      path: RESOURCE.PRODUCT,
      select: "product_name price image",
    },
  ]);

  // const historyUrl = "http://localhost:3000/customer/transactionHistory";

  const emailOptions = {
    to: users?.email,
    subject: "Transaction Successful",
    html: `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #444;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          p {
            font-size: 16px;
            margin-bottom: 20px;
            text-align: center;
          }
          .center {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          a {
            color: #fff;
            background-color: #4caf50;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>CONGRATULATIONS!!!</h1>
          <p> Your Transaction has been successfully completed. We sincerely appreciate your business and thank you for choosing us! </p>
          <p class="center">
            <a href="">Go Back To See Your History</a>
          </p>
        </div>
      </body>
    </html>`,
  };

  await sendEmail(emailOptions);

  return transaction;
};

exports.updateTransactionData = async (req, res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);
  }

  const order = req.body;

  console.log(order)

  order.orderItem.forEach(async item => {
    await updateStock(item.productId, item.quantity)
    console.log("Stock Updated: ", item.product_name)
  })


  const existingTransaction = await Transaction.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true, runValidators: true }
  )
    .lean()
    .exec();

  if (!existingTransaction) {
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);
  }

  const { user, status } = existingTransaction;

  const users = await User.findById(user).select("email");

  if (status === "Completed") {
    // const historyUrl = "http://localhost:3000/";

    const emailOptions = {
      to: users?.email,
      subject: "Congratulations! Your Transaction is Completed",
      html: `<html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              color: #444;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            p {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: center;
            }
            .center {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            a {
              color: #fff;
              background-color: #4caf50;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Congratulations!</h1>
            <p>Your transaction has been successfully completed. We appreciate your business and thank you for choosing us!</p>
            <p class="center">
              <a href="">Go Back To See Your History</a>
            </p>
          </div>
        </body>
      </html>`,
    };

    await sendEmail(emailOptions);
  }

  return existingTransaction;
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock[0] - quantity;

  await product.save({ validateBeforeSave: false })
}

exports.deleteTransactionData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const transaction = await Transaction.findOne({
    _id: id,
  });
  if (!transaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  await Promise.all([
    Transaction.deleteOne({
      _id: id,
    })
      .lean()
      .exec(),
    Comment.deleteMany({
      transaction: id,
    })
      .lean()
      .exec(),
  ]);

  return transaction;
};

exports.getTransactionsPerYear = async () => {
  const transactions = await Transaction.aggregate([
    {
      $group: {
        _id: { $year: "$dateOrdered" },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        year: "$_id",
        totalSales: 1,
        _id: 0,
      },
    },
  ]);

  return transactions;
};


exports.getTransactionsPerMonth = async () => {
  const transactions = await Transaction.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$dateOrdered" }, // Group by year
          month: { $dateToString: { format: "%B", date: "$dateOrdered" } } // Group by month name
        },
        totalAmount: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
    }
  ]);

  return transactions;
};

