const scheduleService = require("../services/schedule.service");

/**
 * @desc Create a new product
 * @route POST /api/products
 */
const createScheduleHandler = async (req, res, next) => {
    try {
        const {
            customerId,
            productId,
            lastServiceDate,
            nextServiceDate,
            time,
        } = req.body;

        const newSchedule = await scheduleService.createSchedule({
            customerId,
            productId,
            lastServiceDate,
            nextServiceDate,
            time,
        });

        return res.status(201).json({
            message: "Schedule created successfully.",
            data: newSchedule,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc fetch products
 * @route GET /api/products
 */
const fetchScheduleHandler = async (req, res, next) => {
    try {
        const fetchSchedules = await scheduleService.fetchSchedules();

        return res.status(200).json({
            message: "Schedule fetched successfully.",
            data: fetchSchedules,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createScheduleHandler,
    fetchScheduleHandler,
};
