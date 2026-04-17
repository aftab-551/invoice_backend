const prisma = require("../../prisma/client");
const cron = require("node-cron");
const { startOfDay, endOfDay, addDays } = require("date-fns");

const ADMIN_USER_ID = 1;

const CRON_SCHEDULE = "5 19 * * *"; //Minute Hour  // Run at 12:01 AM every day
const TIME_ZONE = "Asia/Karachi"; // <<--- IMPORTANT: Set your mechanic's local timezone

async function checkSchedulesAndCreateNotifications() {
    console.log(
        `[${new Date().toISOString()}] Running scheduled task: Check upcoming schedules...`
    );

    const now = new Date();
    // Calculate the start and end of *tomorrow* based on the specified timezone
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = endOfDay(addDays(now, 1));

    // Adjust for Prisma's potential UTC storage if necessary.
    // Often, querying between start/end of day handles timezone differences correctly
    // if the server and database understand the timezone context or store in UTC.
    // Test this thoroughly with your setup.

    console.log(
        `[${new Date().toISOString()}] Checking for schedules between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`
    );

    try {
        const upcomingSchedules = await prisma.schedule.findMany({
            where: {
                nextServiceDate: {
                    gte: tomorrowStart,
                    lt: tomorrowEnd,
                },
            },
            include: {
                customer: {
                    select: {
                        name: true,
                    },
                },
                product: {
                    select: {
                        productServiceName: true,
                    },
                },
            },
        });

        if (upcomingSchedules.length === 0) {
            console.log(
                `[${new Date().toISOString()}] No upcoming schedules found for tomorrow.`
            );
            return;
        }

        console.log(
            `[${new Date().toISOString()}] Found ${
                upcomingSchedules.length
            } schedules for tomorrow.`
        );

        // Prepare notification data
        const notificationsToCreate = upcomingSchedules.map((schedule) => {
            const customerName = schedule.customer?.name || "N/A"; // Handle potential missing relations
            const productName = schedule.product?.productServiceName || "N/A";
            const message = `You have a task due tomorrow. Customer name is ${customerName} and task is ${productName}`;

            return {
                message: message,
                userId: ADMIN_USER_ID,
                scheduleId: schedule.id,
            };
        });

        const result = await prisma.notification.createMany({
            data: notificationsToCreate,
            skipDuplicates: true,
        });

        console.log(
            `[${new Date().toISOString()}] Successfully created ${
                result.count
            } notifications.`
        );
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error checking schedules or creating notifications:`,
            error
        );
    }
}

function startNotificationScheduler() {
    console.log(
        `[${new Date().toISOString()}] Initializing notification scheduler with timezone ${TIME_ZONE}...`
    );

    cron.schedule(
        CRON_SCHEDULE,
        () => {
            checkSchedulesAndCreateNotifications();
        },
        {
            scheduled: true,
            timezone: TIME_ZONE,
        }
    );

    console.log(
        `[${new Date().toISOString()}] Notification scheduler started. Will run daily at ${CRON_SCHEDULE} (${TIME_ZONE}).`
    );
}

module.exports = startNotificationScheduler;
