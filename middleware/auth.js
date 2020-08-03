const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('config');
const apiConfig = config.get('Server.API');

// Middleware to verify the authentication for every single API before making the request
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //if ACCESS_TOKEN is empty, the request will fail with 401 status
    if (token == null) return res.sendStatus(401).json({ code: 401, message: 'Authentication failed, token value is empty!' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403).json({ code: 403, message: 'Error occured while validation the token!' });
        req.user = user;
        next();
    });
}

// Generates the Access Token for API Authentication
const generateAccessToken = (user) => {
    try {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: apiConfig.expiresIn });
    } catch (err) {
        console.log(`Error generating access token!`);
        throw err;
    }
}

// Generates the Access and Refresh Token for API Authentication
const generateAccessAndRefreshToken = (user) => {
    try {
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        return { accessToken: accessToken, refreshToken: refreshToken };
    } catch (err) {
        console.log(`Error generating access and refresh token!`);
        throw err;
    }
};

module.exports = {
    authenticateToken,
    generateAccessToken,
    generateAccessAndRefreshToken
};