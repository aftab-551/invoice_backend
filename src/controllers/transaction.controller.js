const transactionService = require("../services/transaction.service");

/**
 * @desc Create a new transaction
 * @route POST /api/transactions
 */
const createTransactionHandler = async (req, res, next) => {
    try {
        const { customerId, productId, date, quantity, unitPrice, unit } =
            req.body;

        const newTransaction = await transactionService.createTransaction({
            customerId,
            productId,
            date,
            quantity,
            unitPrice,
            unit,
        });

        return res.status(201).json({
            message: "Transaction created successfully.",
            data: newTransaction,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc fetch transactions
 * @route GET /api/transactions
 */
const fetchTransactionHandler = async (req, res, next) => {
    try {
        const fetchTransactions = await transactionService.fetchTransactions();

        return res.status(200).json({
            message: "Transaction fetched successfully.",
            data: fetchTransactions,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransactionHandler,
    fetchTransactionHandler,
};
