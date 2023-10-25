import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './Users';

@Entity("errors")
export class ErrorRecord {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column({ type: 'varchar', length: 4, nullable: true })
    errorCode: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'text' })
    stack: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    @Column({ type: 'text', nullable: true })
    metadata: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
