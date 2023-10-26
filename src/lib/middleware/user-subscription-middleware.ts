import { UserSubscriptionTier } from '../../constants/UserSubscriptionTier';
import { User } from '../../entities/Users';
import AppDataSource from '../../db/db';

export function userSubscriptionMiddleware(requiredTiers: UserSubscriptionTier[]) {
    return (req, res, next) => {
        checkSubscription(requiredTiers, req, res, next);
    };
}

async function checkSubscription(requiredTiers: UserSubscriptionTier[], req, res, next) {
    const user = await AppDataSource.getRepository(User).findOne({
        where: {
            id: req.userData.id,
        }
    });

    if (user && requiredTiers.includes(user.subscriptionTier)) {
        next();
    } else {
        res.errorForbidden();
    }
}
