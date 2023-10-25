const authMiddleware = require('./auth-middleware');
const responseMiddleware = require('./response-middleware');
const subscriptionMiddleware = require('./subscription-middleware');

module.exports = {
    mw: {
        authMiddleware,
        responseMiddleware,
        subscriptionMiddleware
    }
};
