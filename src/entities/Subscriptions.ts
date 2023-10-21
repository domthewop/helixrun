import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './Users';
import { Plan } from './Plans';

@Entity("subscriptions")
export class Subscription {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column()
    stripeSubscriptionId: string;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: 'planId' })
    plan: Plan;

    @Column()
    planId: string;

    @Column({ type: 'enum', enum: ['active', 'canceled', 'past_due', 'unpaid'] })
    status: 'active' | 'canceled' | 'past_due' | 'unpaid';

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}