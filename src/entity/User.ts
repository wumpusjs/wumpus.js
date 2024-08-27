import { Entity, CreateDateColumn, PrimaryColumn, Column } from 'typeorm';

export interface UserData {
	cash: number;
	bank: number;
}

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
		default: {
			cash: 0,
			bank: 0
		}
	})
	data!: UserData

	@CreateDateColumn()
	createdAt!: Date;
}
