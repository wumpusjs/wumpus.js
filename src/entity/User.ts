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
		type: 'jsonb',
		nullable: false,
	})
	data!: {}

	@CreateDateColumn()
	createdAt!: Date;
}
