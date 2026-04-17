const prisma = require("../../prisma/client");

const createProduct = async (data) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Create the product/service
        const newProduct = await tx.productAndService.create({
            data,
        });

        // 2. Update with PN-[id]
        return await tx.productAndService.update({
            where: { id: newProduct.id },
            data: {
                productNumber: `PN-${newProduct.id.toString().padStart(4, '0')}`
            },
        });
    });
};

const fetchProducts = async () => {
    return await prisma.productAndService.findMany({
        orderBy: { id: 'desc' }
    });
};

module.exports = {
    createProduct,
    fetchProducts,
};