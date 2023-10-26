import {
    Entity,
    PrimaryColumn,
    JoinColumn,
    Column,
    CreateDateColumn,
    ManyToOne
} from 'typeorm';
import { Organization } from './Organizations';

@Entity("organization_invites")
export class OrganizationInvite {
    @PrimaryColumn('uuid', {
        default: () => 'uuid_generate_v4()'
    })
    id: string;

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    email: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ default: 'pending' })
    status: 'pending' | 'accepted' | 'cancelled';
}
