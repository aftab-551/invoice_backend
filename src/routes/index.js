const express = require("express");
const customerRoutes = require("./customer.routes.js");
const productRouters = require("./product.routes.js");
const scheduleRoutes = require("./schedule.routes.js");
const transactionRoutes = require("./transaction.routes.js");
const notificationRoutes = require("./notification.routes.js");
const invoiceRoutes = require("./invoice.routes.js");
const invoiceController = require("../controllers/invoice.controller");
// const authRoutes = require("./auth.routes.js");

const router = express.Router();

router.use("/customers", customerRoutes);
router.use("/products", productRouters);
router.use("/schedules", scheduleRoutes);
router.use("/transactions", transactionRoutes);
router.use("/notifications", notificationRoutes);
// List must be registered on the parent router: a bare GET /api/invoices does not always
// reach a child router's GET "/" when mounted at /invoices (path becomes empty).
router.get("/invoices", invoiceController.listInvoicesHandler);
router.use("/invoices", invoiceRoutes);
// router.use("/auth", authRoutes);

module.exports = router;
