import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../role.enum";
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Username: string;

    @Exclude()
    @Column()
    Password: string;

    @Column()
    NumberPhone: number;

    @Column()
    Email: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    Role: Role;
    
    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    resetToken: string;

    @Column({ type: 'datetime', nullable: true, default: null })
    resetTokenExpiration: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    lastModifiedAt: Date; 
    
}
