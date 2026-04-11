const customerService = require("../services/customer.service");

/**
 * @desc Create a new customer
 * @route POST /api/customers
 */
const createCustomerHandler = async (req, res, next) => {
    try {
        const { name, location, postCode, suburb, phoneNumber } = req.body;

        const newCustomer = await customerService.createCustomer({
            name,
            location,
            postCode,
            suburb,
            phoneNumber,
        });

        return res.status(201).json({
            message: "Customer created successfully.",
            data: newCustomer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc fetch customers
 * @route GET /api/customers
 */
const fetchCustomerHandler = async (req, res, next) => {
    try {
        const fetchCustomers = await customerService.fetchCustomers();

        return res.status(200).json({
            message: "Customer fetched successfully.",
            data: fetchCustomers,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCustomerHandler,
    fetchCustomerHandler,
};
