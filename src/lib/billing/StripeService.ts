import Stripe from 'stripe';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: '2023-10-16',
        });
    }

    async createCustomer(email: string): Promise<Stripe.Customer> {
        const customer = await this.stripe.customers.create({
            email,
        });

        return customer;
    }

    async createSubscription(customerId: string, planId: string): Promise<Stripe.Subscription> {
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ plan: planId }],
        });

        return subscription;
    }

    async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        const subscription = await this.stripe.subscriptions.cancel(subscriptionId);

        return subscription;
    }

    async handleWebhook(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'customer.subscription.deleted':
                // Handle subscription cancellation logic here
                break;

            // Handle other events...
        }
    }
}
