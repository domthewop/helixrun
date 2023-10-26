export enum OrganizationSubscriptionTier {
    FREE = 'free',
    STARTUP = 'startup',
    BUSINESS = 'business',
    ENTERPRISE = 'enterprise',
}

export const PlanLimits = {
    free: {
        seats: 5
    },
    startup: {
        seats: 15
    },
    business: {
        seats: 30
    },
    enterprise: {
        seats: 100
    },
};
