const prisma = require("../../prisma/client");

const createTransaction = async (data) => {
    const totalLineAmount = data.quantity * data.unitPrice;

    return await prisma.customerTransaction.create({
        data: { ...data, totalLineAmount },
    });
};

const fetchTransactions = async () => {
    return prisma.customerTransaction.findMany({
        where: {
            // This is the "Magic" line that keeps your Transaction Tab clean
            invoiceId: null 
        },
        include: {
            customer: true,
            product: true
        }
    });
};

module.exports = {
    createTransaction,
    fetchTransactions,
};
