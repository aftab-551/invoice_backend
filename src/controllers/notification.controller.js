const notificationService = require("../services/notification.service");

/**
 * @desc fetch products
 * @route GET /api/products
 */
const fetchNotificationHandler = async (req, res, next) => {
    try {
        const fetchNotifications =
            await notificationService.fetchNotifications();

        return res.status(200).json({
            message: "Notifications fetched successfully.",
            data: fetchNotifications,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchNotificationHandler,
};
