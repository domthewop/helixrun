const jwtDecoder = require('../middleware/jwt/jwt-decoder');
import dotenv from 'dotenv';

dotenv.config();

module.exports = () => {
    function auth(req, res, next) {
        if (req.method === 'OPTIONS') {
            return next();
        }

        let auth = req.headers.authorization;
        if (!auth) return res.errorUnauthorized('No authorization token found');

        jwtDecoder.getUserIdFromToken(process.env.JWT_SECRET, auth).then(user => {
            req.userId = user.id;
            delete(user.password);
            req.userData = user;
            next();
        }).catch(error => {
            res.errorBadRequest(error);
        });
    }

    return auth;
};
