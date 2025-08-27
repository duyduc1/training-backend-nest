import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Upload {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    NameUpload: string;

    @Column({ nullable: true })
    Description: string;

    @Column({ nullable: true })
    ImageUrl: string
}
