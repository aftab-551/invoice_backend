const express = require("express");
const invoiceController = require("../controllers/invoice.controller");

const router = express.Router();

router.get("/", invoiceController.listInvoicesHandler);
router.get("/:id/pdf", invoiceController.getInvoicePdfHandler);
router.patch("/:id", invoiceController.patchInvoiceStatusHandler);
router.post("/generate", invoiceController.createInvoiceHandler);
router.post("/:id/send", invoiceController.sendInvoiceEmailHandler);

module.exports = router;
