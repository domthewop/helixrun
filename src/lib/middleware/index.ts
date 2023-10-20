const authMiddleware = require('./auth-middleware');
const responseMiddleware = require('./response-middleware');

module.exports = {
    mw: {
        authMiddleware,
        responseMiddleware
    }
};
