const jwtDecoder = require('../middleware/jwt/jwt-decoder');
import dotenv from 'dotenv';

dotenv.config();

module.exports = () => {
    function auth(req, res, next) {
        if (req.method === 'OPTIONS') {
            return next();
        }

        let auth = req.headers.authorization;
        if (!auth) {
            return res.errorUnauthorized(401, {
                userMessage: 'No JWT Found',
                context: 'jwt_missing'
            });
        }

        jwtDecoder.getUserIdFromToken(process.env.JWT_SECRET, auth).then(user => {
            req.userId = user.id;
            delete(user.password);
            req.userData = user;
            next();
        }).catch(error => {
            return res.errorUnauthorized(401, {
                userMessage: 'JWT Authentication Invalid or Expired',
                context: 'jwt_invalid_or_expired'
            });
        });
    }

    return auth;
};
