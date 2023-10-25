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
import { SubscriptionTier } from '../constants/SubscriptionTier';

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

    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;

    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];

    @Column({
        type: 'enum',
        enum: SubscriptionTier,
        default: SubscriptionTier.FREE,
    })
    subscriptionTier: SubscriptionTier;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}
