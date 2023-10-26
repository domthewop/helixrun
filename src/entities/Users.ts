import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { Organization } from './Organizations';
import { Subscription } from './Subscriptions';
import { UserSubscriptionTier } from '../constants/UserSubscriptionTier';
import { UserOrganization } from './UserOrganizations';

@Entity("users")
export class User {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp without time zone', nullable: true })
    resetPasswordExpires: Date;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ default: false })
    emailVerified: boolean;

    @OneToMany(() => UserOrganization, userOrganization => userOrganization.userId)
    userOrganizations: UserOrganization[];

    @OneToMany(() => Subscription, (subscription) => subscription.userId)
    subscriptions: Subscription[];

    @Column({
        type: 'enum',
        enum: UserSubscriptionTier,
        default: UserSubscriptionTier.FREE,
    })
    subscriptionTier: UserSubscriptionTier;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}
