const prisma = require('../../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const loginUser = async (email, password) => {
    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email');

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // 3. Generate Token
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, email: user.email, name: user.name } };
};

module.exports = { loginUser };
