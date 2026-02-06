import jwt from 'jsonwebtoken';

const JWT_KEY = 'nyundnc9329cw BDcnecac2';

const getTokenFromRequest = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    return token || null;
};

const getUserFromToken = (token) => {
    try {
        return jwt.verify(token, JWT_KEY);
    } catch (error) {
        return null;
    }
};

const generateUserToken = (user, expiresIn = '1h') => {
    return jwt.sign(user, JWT_KEY, {
        expiresIn: expiresIn,
    });
};

const JWT = {
    getTokenFromRequest,
    getUserFromToken,
    generateUserToken,
};

export default JWT;