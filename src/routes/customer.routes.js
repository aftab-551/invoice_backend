const express = require("express");
const customerController = require("../controllers/customer.controller");
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add 'authenticateToken' as the second argument to protect these routes
router.get("/", customerController.fetchCustomerHandler);
router.post("/", customerController.createCustomerHandler);

module.exports = router;
