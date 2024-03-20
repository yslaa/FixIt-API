const Transaction = require("../models/transaction");
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
    .populate([
      {
        path: RESOURCE.USER,
        select: "name",
      },
      {
        path: RESOURCE.PRODUCT,
        select: "product_name price image",
      },
    ])
    .lean()
    .exec();

  return transactions;
};

exports.getSingleTransactionData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const transaction = await Transaction.findById(id)
    .populate([
      {
        path: RESOURCE.USER,
        select: "name",
      },
      {
        path: RESOURCE.PRODUCT,
        select: "product_name price image",
      },
    ])
    .lean()
    .exec();

  if (!transaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  return transaction;
};

exports.createTransactionData = async (data) => {
  const { user: userId, product, date } = data;

  const user = await User.findById(userId).select("email");

  const transaction = await Transaction.create({
    user: userId,
    product,
    date,
  });

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

  const historyUrl = "http://localhost:3000/customer/transactionHistory";

  const emailOptions = {
    to: user?.email,
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
            <a href="${historyUrl}">Go Back To See Your History</a>
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

  const existingTransaction = await Transaction.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true, runValidators: true }
  )
    .populate([
      {
        path: RESOURCE.USER,
        select: "name email",
      },
      {
        path: RESOURCE.PRODUCT,
        select: "product_name price image",
      },
    ])
    .lean()
    .exec();

  if (!existingTransaction) {
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);
  }

  const { user, status } = existingTransaction;

  if (status === "Completed") {
    const historyUrl = "http://localhost:3000/";

    const emailOptions = {
      to: user?.email,
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
              <a href="${historyUrl}">Go Back To See Your History</a>
            </p>
          </div>
        </body>
      </html>`,
    };

    await sendEmail(emailOptions);
  }

  return existingTransaction;
};

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
