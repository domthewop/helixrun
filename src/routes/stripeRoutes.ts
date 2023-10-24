import express, { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import dotenv from 'dotenv';
import { Subscription } from '../entities/Subscriptions';
import {getRepository} from "typeorm";
import {User} from "../entities/Users";

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const router = Router();
router.use(apiResponse());

router.post('/create-checkout-session', authMiddleware());
router.post('/create-checkout-session', async (req: Request, res: Response) => {
    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
    });
    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                quantity: 1,

            },
        ],
        mode: 'subscription',
        // @ts-ignore
        client_reference_id: req.userData['userId'],
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ session: session });
});

router.post('/create-portal-session', authMiddleware());
router.post('/create-portal-session', async (req, res) => {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically, this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.STRIPE_MANAGE_RETURN_URL;

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: returnUrl,
    });

    return res.status(200).json({ session: portalSession });
});

router.post('/webhook', async (req, res) => {
    let event = req.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log('Webhook signature verification failed. ', err.message);
            return res.sendStatus(400);
        }
    }

    let invoice;
    let subscriptionId;

    // Handle the event
    switch (event.type) {
        case 'invoice.paid':
            invoice = event.data.object;
            subscriptionId = invoice.subscription;

            // Create the new subscription
            const subscriptionRepository = getRepository(Subscription);

            // Update subscription to active it one already exists
            const existingSubscription = await subscriptionRepository.findOne({ where: { stripeSubscriptionId: subscriptionId } });

            if (existingSubscription && invoice.status == 'paid') {
                existingSubscription.status = 'active';
                await subscriptionRepository.save(existingSubscription);
            } else if (!existingSubscription && invoice.status == 'paid') {
                const newSubscription = {
                    userId: '746dc2fa-3fb1-4c77-8c33-8cd6c2d671ca',
                    planId: '5d69a6c6-2f4e-435a-9900-24e6c5b3fd0f',
                    stripeSubscriptionId: subscriptionId,
                    status: 'active'
                };

                try {
                    //@ts-ignore
                    const subscription = subscriptionRepository.create(newSubscription);
                    const results = await subscriptionRepository.save(subscription); // saves the user in the database

                    return res.status(201).json(results);
                } catch (error) {

                    return res.status(500).json({ error: error.message });
                }
            }

            break;
        default:
            // Unexpected event type
            // console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

module.exports = router;
