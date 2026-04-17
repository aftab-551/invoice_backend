const prisma = require("../../prisma/client");

const createCustomer = async (data) => {
    // We use a transaction to ensure both steps happen or none at all
    return await prisma.$transaction(async (tx) => {
        // 1. Create the customer to get the ID
        const newCustomer = await tx.customer.create({
            data,
        });

        // 2. Update the customer with the formatted CN-[id]
        return await tx.customer.update({
            where: { id: newCustomer.id },
            data: {
                customerNumber: `CN-${newCustomer.id.toString().padStart(4, '0')}`
            },
        });
    });
};

const fetchCustomers = async () => {
    return await prisma.customer.findMany({
        orderBy: { id: 'desc' } // Optional: puts newest at the top
    });
};

module.exports = {
    createCustomer,
    fetchCustomers,
};
