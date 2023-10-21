import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn
} from 'typeorm';

@Entity("plans")
export class Plan {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column()
    stripePlanId: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}
