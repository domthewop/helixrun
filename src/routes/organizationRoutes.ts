import { Request, Response, Router } from 'express';
const authMiddleware = require('../lib/middleware').mw.authMiddleware;
const apiResponse = require('../lib/middleware/index').mw.responseMiddleware;
import { userSubscriptionMiddleware } from '../lib/middleware/user-subscription-middleware';
import { organizationSubscriptionMiddleware } from '../lib/middleware/organization-subscription-middleware';
import AppDataSource from '../db/db';
import { User } from '../entities/Users';
import { UserSubscriptionTier } from '../constants/UserSubscriptionTier';
import { OrganizationSubscriptionTier, PlanLimits } from '../constants/OrganizationSubscriptionTier';
import { Organization } from '../entities/Organizations';
import { UserOrganization } from '../entities/UserOrganizations';
import { OrganizationInvite } from '../entities/OrganizationInvites';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
router.use(apiResponse());

router.post('/create',
    authMiddleware(),
    userSubscriptionMiddleware([
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
            return res.errorBadRequest(400, {
                userMessage: 'User not found',
                context: 'org_creation_username_not_found'
            });
        }

        // Get the organization name from the request body
        const { organizationName } = req.body;

        if (!organizationName) {
            return res.errorBadRequest(400, {
                userMessage: 'Organization name is required',
                context: 'org_creation_name_missing'
            });
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
            return res.errorInternalError(500, {
                userMessage: 'Faled to create organization',
                context: 'org_creation_internal_error',
                name: organizationName
            });
        }
    }
);

// organizationRoutes.ts

router.post('/invite',
    authMiddleware(),
    organizationSubscriptionMiddleware([OrganizationSubscriptionTier.FREE, OrganizationSubscriptionTier.BUSINESS, OrganizationSubscriptionTier.ENTERPRISE]),
    async (req: Request, res: Response) => {
        const { email, organizationId } = req.body;

        if (!email || !organizationId) {
            return res.errorBadRequest(400, {
                userMessage: 'Email and organization ID are required',
                context: 'org_invite_email_or_org_missing'
            });
        }

        const organizationRepository = AppDataSource.getRepository(Organization);
        const organization = await organizationRepository.findOne({ where: { id: organizationId } });

        if (!organization) {
            return res.errorNotFound(400, {
                userMessage: 'Organization not found',
                context: 'org_invite_org_not_found'
            });
        }

        // Check if the organization has remaining seats
        const invitesCount = await AppDataSource.getRepository(OrganizationInvite)
            .count({ where: { organizationId: organization.id } });

        const planLimits = PlanLimits[organization.subscriptionTier];

        if (invitesCount >= planLimits.seats) {
            return res.errorBadRequest(400, {
                userMessage: 'Unable to send invite. Please make sure you are part of the organization and that it meets the necessary requirements.',
                context: 'org_invite_no_remaining_seats'
            });
        }

        const inviteRepository = AppDataSource.getRepository(OrganizationInvite);
        const existingInvite = await inviteRepository.findOne({
            where: {
                organizationId: organization.id,
                email,
                status: 'pending',
            },
        });

        if (existingInvite) {
            return res.errorBadRequest(400, {
                userMessage: 'Invite for that user already exists.',
                context: 'org_invite_already_exists'
            });
        }

        const newInvite = new OrganizationInvite();
        newInvite.email = email;
        newInvite.organizationId = organization.id;
        newInvite.status = 'pending';
        newInvite.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Expires in 3 days

        const savedInvite = await inviteRepository.save(newInvite);

        // Send an email invitation here...

        res.status(200).json(savedInvite);
    }
);


module.exports = router;
