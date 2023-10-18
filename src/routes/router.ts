'use strict';

module.exports = function (app) {
    // app.use('/v0.1/', require('./routes/v0.1/root'));
    app.use('/v0/users', require('./userRoutes.ts'));
};