import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity({ name: 'buttons' })
export default class Button {
	@PrimaryColumn({
		type: 'varchar',
		length: 64,
		unique: true,
		nullable: false,
	})
	id!: string;

	@Column({
		type: 'simple-array',
		nullable: false,
	})
	data!: string[];

	@Column({
		type: 'varchar',
		nullable: false,
	})
	identifier!: string;

	@CreateDateColumn()
	createdAt!: Date;
}
