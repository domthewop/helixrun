import { SubscriptionTier, tierAccessLevels } from '../../constants/SubscriptionTier';
import { User } from '../../entities/Users';
import {getRepository} from "typeorm";

export function subscriptionMiddleware(requiredTiers: SubscriptionTier[]) {
    return (req, res, next) => {
        checkSubscription(requiredTiers, req, res, next);
    };
}

async function checkSubscription(requiredTiers: SubscriptionTier[], req, res, next) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.userData.id } });

    if (user && requiredTiers.some(tier => tierAccessLevels[user.subscriptionTier] >= tierAccessLevels[tier])) {
        next();
    } else {
        res.errorForbidden();
    }
}
