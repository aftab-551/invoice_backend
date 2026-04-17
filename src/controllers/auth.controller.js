const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Raw Password from Frontend:", `'${password}'`);
        const result = await authService.loginUser(email, password);
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            ...result
        });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = { login };