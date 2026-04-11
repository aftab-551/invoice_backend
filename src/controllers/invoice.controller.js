const invoiceService = require("../services/invoice.service");
const generateInvoicePdf = require("../services/pdfGenerator.service");

const listInvoicesHandler = async (req, res, next) => {
    try {
        const invoices = await invoiceService.listInvoices();
        res.status(200).json({
            message: "Invoices fetched successfully.",
            data: invoices,
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error listing invoices:`,
            error
        );
        next(error);
    }
};

const patchInvoiceStatusHandler = async (req, res, next) => {
    try {
        const { status } = req.body ?? {};
        if (!status) {
            return res.status(400).json({
                message: "Request body must include status.",
            });
        }
        const updated = await invoiceService.updateInvoiceStatus(
            req.params.id,
            status
        );
        res.status(200).json({
            message: "Invoice status updated.",
            data: updated,
        });
    } catch (error) {
        if (error.message === "Invoice not found.") {
            return res.status(404).json({ message: error.message });
        }
        if (
            error.message &&
            error.message.includes("Status must be PENDING or SENT")
        ) {
            return res.status(400).json({ message: error.message });
        }
        console.error(
            `[${new Date().toISOString()}] Error updating invoice status:`,
            error
        );
        next(error);
    }
};

const getInvoicePdfHandler = async (req, res, next) => {
    try {
        const invoice = await invoiceService.getInvoiceWithDetails(
            req.params.id
        );
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        const inline =
            req.query.inline === "1" ||
            req.query.disposition === "inline";

        const pdfBuffer = await generateInvoicePdf(
            invoice,
            invoice.customer,
            invoice.transactions || []
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `${
                inline ? "inline" : "attachment"
            }; filename="invoice-${invoice.invoiceNumber}.pdf"`
        );
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.send(pdfBuffer);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error generating invoice PDF:`,
            error
        );
        next(error);
    }
};

/**
 * @route POST /api/invoices/generate
 */
const createInvoiceHandler = async (req, res, next) => {
    const { customerTransactionIds, customerId, saveOnly } = req.body;

    if (
        !customerId ||
        !Array.isArray(customerTransactionIds) ||
        customerTransactionIds.length === 0
    ) {
        return res.status(400).json({
            message: "Customer ID and a list of transaction IDs are required.",
        });
    }

    try {
        // Create invoice in database
        const newInvoice = await invoiceService.createInvoice({
            customerTransactionIds,
            customerId,
        });

        if (saveOnly) {
            return res.status(201).json({
                message: "Invoice created successfully.",
                invoice: {
                    id: newInvoice.id,
                    invoiceNumber: newInvoice.invoiceNumber,
                    totalAmount: newInvoice.totalAmount.toString(),
                    customerId: newInvoice.customerId,
                    issueDate: newInvoice.issueDate,
                    status: newInvoice.status,
                },
            });
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePdf(
            newInvoice,
            newInvoice.customer,
            newInvoice.transactions
        );

        // Send PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment;filename="invoice-${newInvoice.invoiceNumber}.pdf"`
        );
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.send(pdfBuffer);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error generating invoice:`,
            error
        );
        next(error);
    }
};

module.exports = {
    createInvoiceHandler,
    listInvoicesHandler,
    getInvoicePdfHandler,
    patchInvoiceStatusHandler,
};
