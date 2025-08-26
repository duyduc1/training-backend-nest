import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ProductName: string;

    @Column({ nullable: true })
    Price: number;

    @Column({ nullable: true})
    Description: string;
}
