const prisma = require("../../prisma/client");

const fetchNotifications = async () => {
    return await prisma.notification.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

module.exports = {
    fetchNotifications,
};
