const prisma = require("../../prisma/client");

const createCustomer = async (data) => {
    return await prisma.customer.create({
        data,
    });
};

const fetchCustomers = async () => {
    return await prisma.customer.findMany();
};

module.exports = {
    createCustomer,
    fetchCustomers,
};
