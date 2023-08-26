import { Entity, PrimaryColumn, Column } from 'typeorm';

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
}
