import {
	Entity,
	CreateDateColumn,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	Column,
} from 'typeorm';

@Entity({ name: 'permissions' })
export default class Permission {
	@PrimaryGeneratedColumn()
	id!: number;

	@PrimaryColumn({
		type: 'varchar',
		length: 36,
		unique: true,
		nullable: false,
	})
	userID!: string;

	@Column({
		type: 'varchar',
		length: 36,
		nullable: false,
	})
	permission!: string;

	@CreateDateColumn()
	createdAt!: Date;
}
