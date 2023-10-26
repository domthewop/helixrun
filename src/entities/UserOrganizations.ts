import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
} from 'typeorm';
import { User } from './Users';
import { Organization } from './Organizations';

@Entity("user_organizations")
export class UserOrganization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.userOrganizations)
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: "organizationId" })
    organization: Organization;

    @Column()
    organizationId: string;

    @Column()
    isAdmin: boolean;
}
