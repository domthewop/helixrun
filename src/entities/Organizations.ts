import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany, CreateDateColumn,
} from 'typeorm';
import { User } from './Users';
import { OrganizationSubscriptionTier } from '../constants/OrganizationSubscriptionTier';
import { Subscription } from './Subscriptions';
import { UserOrganization } from './UserOrganizations';

@Entity("organizations")
export class Organization {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: OrganizationSubscriptionTier,
        default: OrganizationSubscriptionTier.FREE,
    })
    subscriptionTier: OrganizationSubscriptionTier;

    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];

    @Column({ default: 0 })
    seats: number;

    @OneToMany(() => UserOrganization, userOrganization => userOrganization.organizationId)
    userOrganizations: UserOrganization[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}
