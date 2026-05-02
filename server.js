require("dotenv").config();
const express = require("express");
const cors = require("cors");

// 1. Import Routes and Middleware
const authRoutes = require("./src/routes/auth.routes.js"); // Assuming you have a separate auth file
const apiRoutes = require("./src/routes/index.js");
const authenticateToken = require('./src/middleware/auth.js'); // JWT authentication middleware
const startNotificationScheduler = require("./src/scheduler/notificationScheduler.js");

const app = express();
const PORT = process.env.PORT || 3001;

// 2. Standard Middleware
app.use(express.json());
app.use(cors());


app.use(cors({
  origin: "*"
}));

// 3. PUBLIC ROUTES
// These MUST stay above the authenticateToken middleware
// so users can actually log in to get a token.
app.use("/api/auth", authRoutes); 

// 4. THE GATEWAY (Protect everything below this line)
// app.use(authenticateToken); 

// 5. PROTECTED ROUTES
// Now, any request to /api/customers, /api/invoices, etc., 
// will require a valid Bearer Token.
app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(
        `Backend server is running successfully on http://localhost:${PORT}`
    );
    // This runs internally on the server, no token needed.
    startNotificationScheduler(); 
});
