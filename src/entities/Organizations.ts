import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany, CreateDateColumn,
} from 'typeorm';
import { User } from './Users';
import { SubscriptionTier } from '../constants/SubscriptionTier';

@Entity("organizations")
export class Organization {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: SubscriptionTier })
    subscriptionTier: SubscriptionTier;

    @Column({ default: 0 })
    seats: number;

    @OneToMany(() => User, (user) => user.organization)
    users: User[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}