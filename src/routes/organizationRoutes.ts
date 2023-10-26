import { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import { subscriptionMiddleware } from '../lib/middleware/subscription-middleware';
import AppDataSource from '../db/db';
import { User } from '../entities/Users';
import { UserSubscriptionTier } from '../constants/UserSubscriptionTier';
import { Organization } from '../entities/Organizations';
import { UserOrganization } from '../entities/UserOrganizations';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
router.use(apiResponse());

router.post('/create',
    authMiddleware(),
    subscriptionMiddleware([
        UserSubscriptionTier.FREE,
        UserSubscriptionTier.PREMIUM,
        UserSubscriptionTier.PRO,
        UserSubscriptionTier.ENTERPRISE
    ]),
    async (req: Request, res: Response) => {
        // Get the user's ID from the request
        const userId = req.userId;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            // Handle the case where the user is not found
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the organization name from the request body
        const { organizationName } = req.body;

        if (!organizationName) {
            return res.errorBadRequest("Organization name is required");
        }

        // Create a new organization
        const organization = new Organization();
        organization.name = organizationName;

        try {
            // Save the organization to the database
            const savedOrganization = await AppDataSource.getRepository(Organization).save(organization);

            // Create a link entry between the user and the organization
            const userOrganization = new UserOrganization();
            userOrganization.userId = userId;
            userOrganization.user = user;
            userOrganization.organizationId = savedOrganization.id;
            userOrganization.isAdmin = true;  // set the user as an admin
            await AppDataSource.getRepository(UserOrganization).save(userOrganization);

            // Respond with the created organization
            res.success(savedOrganization);
        } catch (error) {
            console.log(error);
            res.errorInternalError("Failed to create organization");
        }
    }
);

module.exports = router;
