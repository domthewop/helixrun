const authMiddleware = require('./auth-middleware');

module.exports = {
    mw: {
        authMiddleware,
    }
};
