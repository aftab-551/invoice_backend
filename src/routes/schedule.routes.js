const express = require("express");
const scheduleController = require("../controllers/schedule.controller");

const router = express.Router();

router.post("/", scheduleController.createScheduleHandler);
router.get("/", scheduleController.fetchScheduleHandler);

module.exports = router;
