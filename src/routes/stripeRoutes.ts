import { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import dotenv from 'dotenv';

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

module.exports = router;
