import { OrganizationSubscriptionTier } from '../../constants/OrganizationSubscriptionTier';
import { Organization } from "../../entities/Organizations";
import AppDataSource from '../../db/db';

import * as Joi from 'joi';
const uuidSchema = Joi.string().guid({ version: 'uuidv4' });

export function organizationSubscriptionMiddleware(requiredTiers: OrganizationSubscriptionTier[]) {
    return (req, res, next) => {
        const { error } = uuidSchema.validate(req.body.organizationId);
        if (error) {
            return res.errorBadRequest(400, {
                userMessage: 'Organization id is invalid',
                context: 'org_invite_org_id_invalid_not_uuidv4'
            });
        }

        checkSubscription(requiredTiers, req.body.organizationId, req, res, next);
    };
}

async function checkSubscription(requiredTiers: OrganizationSubscriptionTier[], organizationId: string, req, res, next) {
    // Retrieve the organization from the database
    const organization = await AppDataSource.getRepository(Organization).findOne({
        where: {
            id: organizationId,
        },
    });

    // Check if the organization exists
    if (!organization) {
        return res.errorUnauthorized();
    }

    // Check if the organization has the required subscription tier
    if (requiredTiers.includes(organization.subscriptionTier)) {
        next();
    } else {
        res.status(403).json({ message: 'Organization does not have the required subscription tier' });
    }
}
