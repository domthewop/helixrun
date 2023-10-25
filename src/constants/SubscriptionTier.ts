export enum SubscriptionTier {
    FREE = 'free',
    PREMIUM = 'premium',
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export const tierAccessLevels = {
    [SubscriptionTier.FREE]: 1,
    [SubscriptionTier.PREMIUM]: 2,
    [SubscriptionTier.PRO]: 3,
    [SubscriptionTier.ENTERPRISE]: 4,
};
