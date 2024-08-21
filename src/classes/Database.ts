import { Client } from 'discord.js';
import { DataSource } from 'typeorm';
import path, { sep } from 'path';
import { error } from '../utils/logger';
import { getRepositoryToken } from '../utils/typeorm';
import { getFiles } from '../utils/file';

export default class Database {
	client: Client & { datasource: DataSource };

	constructor(client: Client & { datasource: DataSource }) {
		this.client = client;
		(this.client as any).repositories = new Map();
		client.datasource = new DataSource({
			type: 'mysql',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			synchronize: process.env.ENVIRONMENT === 'development',
			entities: [
				path.join(__dirname, '../') + `**${sep}entity${sep}*{.ts,.js}`,
			],
		});
		(this.client as any).repository = (name: string) =>
			(this.client as any).repositories.get(name);
	}

	async initialize() {
		await this.client.datasource.initialize().catch(() => {
			error('Failed to connect to database');
			process.exit(1);
		});

		const list = await getFiles(
			'./src/entity',
			['ts', 'js'],
			['node_modules']
		);

		if (!list.success) return;

		for (const file of list.files) {
			const entity = require(path.join(
				__dirname,
				`../entity/${file}`
			)).default;
			const token = getRepositoryToken(entity as any);

			const repository = this.client.datasource.getRepository(entity);
			(this.client as any).repositories.set(token, repository);
		}
	}
}