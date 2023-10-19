import {
    Entity,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

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

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;
}
