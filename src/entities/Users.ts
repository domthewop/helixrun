import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Subscription } from './Subscriptions';

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

    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}
