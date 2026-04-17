const prisma = require("../../prisma/client");

const createSchedule = async (data) => {
    return await prisma.schedule.create({
        data,
    });
};

const fetchSchedules = async () => {
    return await prisma.schedule.findMany({
        include: {
            customer: {
                select: { name: true ,customerNumber: true},
            },
            product: {
                select: { productServiceName: true ,productNumber: true},
            },
        },
    });
};

module.exports = {
    createSchedule,
    fetchSchedules,
};
