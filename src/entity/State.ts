import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity({ name: 'states' })
export default class State {
	@PrimaryColumn({
		type: 'varchar',
		length: 64,
		unique: true,
		nullable: false,
	})
	id!: string;

	@Column({
		type: 'jsonb',
		nullable: false,
	})
	state!: Record<string, any>;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	identifier!: string;

	@CreateDateColumn()
	createdAt!: Date;
}
