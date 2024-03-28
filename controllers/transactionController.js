const SuccessHandler = require("../utils/successHandler");
const ErrorHandler = require("../utils/errorHandler");
const transactionsService = require("../services/transactionService");
const asyncHandler = require("express-async-handler");
const checkRequiredFields = require("../helpers/checkRequiredFields");
const { STATUSCODE } = require("../constants/index");

exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await transactionsService.getAllTransactionData();

  return transactions?.length === STATUSCODE.ZERO
    ? next(new ErrorHandler("No transactions found"))
    : SuccessHandler(
        res,
        `Transactions with transaction ${transactions
          .map((p) => p?.user?.name)
          .join(", ")} and IDs ${transactions
          .map((p) => p?._id)
          .join(", ")} retrieved`,
        transactions
      );
});

exports.getSingleTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await transactionsService.getSingleTransactionData(
    req.params.id
  );

  return !transaction
    ? next(new ErrorHandler("No transaction found"))
    : SuccessHandler(
        res,
        `Transaction of ${transaction?.user?.name} is ${transaction?.status}`,
        transaction
      );
});

exports.createNewTransaction = [
  checkRequiredFields(["user", "orderItems"]),
  asyncHandler(async (req, res, next) => {
    const { 
      user,
      status,
      dateOrdered,
      payment,
      shippingInfo,
      itemsPrice,
      shippingPrice,
      totalPrice
    } = req.body;
    const orderItems = req.body.orderItems || [];

    const transactionData = {
      user,
      status,
      dateOrdered,
      payment,
      shippingInfo,
      orderItems,
      itemsPrice,
      shippingPrice,
      totalPrice
    };

    console.log(transactionData);

    const transaction = await transactionsService.createTransactionData(
      transactionData
    );

    return SuccessHandler(
      res,
      `Transaction of ${transaction?.user?.name} with ID ${transaction?._id} is created`,
      transaction
    );
  }),
];

exports.updateTransaction = [
  checkRequiredFields(["status"]),
  asyncHandler(async (req, res, next) => {
    const transaction = await transactionsService.updateTransactionData(
      req,
      res,
      req.params.id
    );

    return SuccessHandler(
      res,
      `Transaction on ${transaction?.date} with ID ${transaction?._id} is updated`,
      transaction
    );
  }),
];

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await transactionsService.deleteTransactionData(
    req.params.id
  );

  return !transaction
    ? next(new ErrorHandler("No transaction found"))
    : SuccessHandler(
        res,
        `Transaction on ${transaction?.date} with ID ${transaction?._id} is deleted`,
        transaction
      );
});
