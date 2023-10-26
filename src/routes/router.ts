'use strict';

module.exports = function (app) {
    // app.use('/v0.1/', require('./routes/v0.1/root'));
    app.use('/v0/billing/stripe', require('./stripeRoutes.ts'));
    app.use('/v0/organizations', require('./organizationRoutes.ts'));
    app.use('/v0/users', require('./userRoutes.ts'));
};