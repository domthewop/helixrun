import { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import { subscriptionMiddleware } from '../lib/middleware/subscription-middleware';
import { SubscriptionTier, tierAccessLevels } from '../constants/SubscriptionTier';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
router.use(apiResponse());

router.post('/create',
    authMiddleware(),
    subscriptionMiddleware(
    [
        SubscriptionTier.FREE,
        SubscriptionTier.PREMIUM,
        SubscriptionTier.PRO,
        SubscriptionTier.ENTERPRISE
    ])
);
router.post('/create', async (req: Request, res: Response) => {
    res.status(200).json({ result: req.userData });
});
