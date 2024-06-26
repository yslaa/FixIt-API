const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { verifyJWT, authorizeRoles } = require("../middleware/verifyJWT");
const { METHOD, PATH, ROLE } = require("../constants/index");

router.use(verifyJWT);

const transactionRoutes = [
  {
    method: METHOD.GET,
    path: PATH.TRANSACTIONS,
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.CUSTOMER],
    handler: transactionController.getAllTransactions,
  },
  {
    method: METHOD.POST,
    path: PATH.TRANSACTIONS,
    roles: [ROLE.CUSTOMER],
    handler: transactionController.createNewTransaction,
  },
  {
    method: METHOD.GET,
    path: PATH.TRANSACTION_ID,
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.CUSTOMER],
    handler: transactionController.getSingleTransaction,
  },
  {
    method: METHOD.PATCH,
    path: PATH.EDIT_TRANSACTION_ID,
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE],
    handler: transactionController.updateTransaction,
  },
  {
    method: METHOD.DELETE,
    path: PATH.TRANSACTION_ID,
    roles: [ROLE.ADMIN],
    handler: transactionController.deleteTransaction,
  },
  {
    method: METHOD.GET,
    path: PATH.TRANSACTIONS_YEAR,
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE],
    handler: transactionController.getTransactionsPerYear,
  },
  {
    method: METHOD.GET,
    path: PATH.TRANSACTIONS_MONTH,
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE],
    handler: transactionController.getTransactionsPerMonth,
  },
];

transactionRoutes.forEach((route) => {
  const { method, path, roles, handler } = route;
  router[method](path, authorizeRoles(...roles), handler);
});
module.exports = router;