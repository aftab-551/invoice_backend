const productService = require("../services/product.service");

/**
 * @desc Create a new product
 * @route POST /api/products
 */
const createProductHandler = async (req, res, next) => {
    try {
        const { productType, productServiceName, unitPrice, unit } = req.body;

        const newProduct = await productService.createProduct({
            productType,
            productServiceName,
            unitPrice,
            unit,
        });

        return res.status(201).json({
            message: "Product/Service created successfully.",
            data: newProduct,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc fetch products
 * @route GET /api/products
 */
const fetchProductHandler = async (req, res, next) => {
    try {
        const fetchProducts = await productService.fetchProducts();

        return res.status(200).json({
            message: "Product/Service fetched successfully.",
            data: fetchProducts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProductHandler,
    fetchProductHandler,
};
