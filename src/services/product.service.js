const prisma = require("../../prisma/client");

const createProduct = async (data) => {
    return await prisma.productAndService.create({
        data,
    });
};

const fetchProducts = async () => {
    return await prisma.productAndService.findMany();
};

module.exports = {
    createProduct,
    fetchProducts,
};
