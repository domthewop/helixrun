import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

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

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;
}
