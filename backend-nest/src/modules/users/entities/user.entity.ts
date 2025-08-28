import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Role } from "src/enum/role.enum";
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Exclude()
    @Column()
    password: string;

    @Column()
    numberPhone: number;

    @Column()
    email: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;
    
    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    resetToken: string;

    @Column({ type: 'timestamp', nullable: true, default: null })
    resetTokenExpiration: Date;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;


    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt?: Date;
    
}
