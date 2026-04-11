const prisma = require("../../prisma/client");
const { Prisma } = require("../generated/prisma/client");
const { format } = require("date-fns");

const listInvoices = async () => {
    return prisma.invoice.findMany({
        orderBy: { id: "desc" },
        include: {
            customer: true,
        },
    });
};

const updateInvoiceStatus = async (id, status) => {
    const allowed = new Set(["PENDING", "SENT","PAID"]);
    const s = String(status).toUpperCase();
    if (!allowed.has(s)) {
        throw new Error("Status must be PENDING, PAID or SENT.");
    }
    const numId = Number(id);
    if (Number.isNaN(numId)) {
        throw new Error("Invalid invoice id.");
    }
    try {
        return await prisma.invoice.update({
            where: { id: numId },
            data: { status: s },
            include: { customer: true },
        });
    } catch (error) {
        if (error.code === "P2025") {
            throw new Error("Invoice not found.");
        }
        throw error;
    }
};

const getInvoiceWithDetails = async (id) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
        return null;
    }
    return prisma.invoice.findUnique({
        where: { id: numId },
        include: {
            customer: true,
            transactions: {
                include: { product: true },
            },
        },
    });
};


const createInvoice = async ({ customerTransactionIds, customerId }) => {
    return await prisma.$transaction(async (tx) => {
        const idList = [
            ...new Set(
                customerTransactionIds.map((id) => Number(id))
            ),
        ];
        const custId = Number(customerId);

        const transactions = await tx.customerTransaction.findMany({
            where: {
                id: { in: idList },
                customerId: custId,
            },
            include: {
                customer: true,
                product: true,
            },
        });

        if (transactions.length !== idList.length) {
            const foundIds = new Set(transactions.map((t) => t.id));
            const missingIds = idList.filter((id) => !foundIds.has(id));
            throw new Error(
                `Invalid transaction IDs or mismatching customer. Missing/Invalid: ${missingIds.join(
                    ", "
                )}`
            );
        }

        const oldInvoiceIds = [
            ...new Set(
                transactions
                    .map((t) => t.invoiceId)
                    .filter((id) => id != null)
            ),
        ];

        const customer = transactions[0]?.customer;
        if (!customer) {
            throw new Error("Customer data not found for the transactions.");
        }

        const totalAmount = transactions.reduce((sum, tx) => {
            return new Prisma.Decimal(sum).plus(tx.totalLineAmount);
        }, new Prisma.Decimal(0));

        const datePart = format(new Date(), "yyyyMMdd");
        const tempInvoiceNumber = `INV-${datePart}-${Date.now()
            .toString()
            .slice(-4)}`;

        const createdInvoice = await tx.invoice.create({
            data: {
                invoiceNumber: tempInvoiceNumber,
                customerId: custId,
                issueDate: new Date(),
                totalAmount: totalAmount,
                status: "PENDING",
            },
        });

        await tx.customerTransaction.updateMany({
            where: { 
                id: { in: idList } 
            },
            data: { 
                invoiceId: createdInvoice.id 
            },
        });

        for (const invId of oldInvoiceIds) {
            const remaining = await tx.customerTransaction.count({
                where: { invoiceId: invId },
            });
            if (remaining === 0) {
                await tx.invoice.delete({ where: { id: invId } });
            }
        }

        // update the invoice number based on the final ID for sequences
        await tx.invoice.update({
            where: { id: createdInvoice.id },
            data: { invoiceNumber: `INV-${createdInvoice.id}` },
        });
        createdInvoice.invoiceNumber = `INV-${createdInvoice.id}`;

        // Return the created invoice along with related data needed for PDF
        return {
            ...createdInvoice,
            customer: customer,
            transactions: transactions,
        };
    }); // --- End Transaction ---
};

module.exports = {
    createInvoice,
    listInvoices,
    getInvoiceWithDetails,
    updateInvoiceStatus,
};
