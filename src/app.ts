import express from 'express';
import "reflect-metadata"; // Required for TypeORM
import { createConnection } from "typeorm";
import * as config from "./ormconfig";
import dotenv from 'dotenv';

// Initialize dotenv to load environment variables
dotenv.config();

// Create an instance of an Express app
const app = express();

// Starting the server
const PORT = process.env.PORT || 3000;
createConnection(config).then(async connection => {

    // Middleware to send RAW requests to Stripe webhook route
    app.use('/v0/billing/stripe/webhook', express.raw({ type: 'application/json' }));

    // Middleware to parse JSON requests
    app.use(express.json());  // for parsing application/json
    app.use(express.urlencoded({ extended: true }));
    require('./routes/router')(app);

    app.listen(PORT, () => {
        console.log(`HelixRUN listening on http://localhost:${PORT}`);
    });

}).catch(error => console.log("TypeORM connection error: ", error));

export default app;  // Exporting the app instance for potential testing or further modularization
