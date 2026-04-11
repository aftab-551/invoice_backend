// This function MUST have 4 arguments to be recognized by Express as error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("--- ERROR ---");
    console.error("Status Code:", err.statusCode || 500);
    console.error("Message:", err.message);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    const message = err.message || "Something went wrong on the server.";

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Only include stack trace in development environment for security reasons
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorHandler;
