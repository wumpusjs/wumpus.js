import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export default class User {
	@PrimaryColumn({
		type: 'varchar',
		length: 36,
		unique: true,
		nullable: false,
	})
	id!: string;

	@CreateDateColumn()
	createdAt!: Date;
}
