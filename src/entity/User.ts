import { Entity, CreateDateColumn, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export default class User {
	@PrimaryColumn({
		type: 'varchar',
		length: 36,
		unique: true,
		nullable: false,
	})
	id!: string;

	@Column({
		type: 'simple-array',
		nullable: false,
	})
	data!: string[];

	@CreateDateColumn()
	createdAt!: Date;
}
