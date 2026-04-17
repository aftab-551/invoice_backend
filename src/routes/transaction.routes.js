const express = require("express");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

router.post("/", transactionController.createTransactionHandler);
router.get("/", transactionController.fetchTransactionHandler);

module.exports = router;
