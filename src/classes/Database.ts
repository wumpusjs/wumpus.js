import { DataSource, Repository } from 'typeorm';
import path, { sep } from 'path';
import { error } from '../utils/logger';
import { getRepositoryToken } from '../utils/typeorm';
import { getFiles } from '../utils/file';
import Wumpus from '../structures/wumpus';
import { RepositoriesMap } from '../interfaces/repositories';

export default class Database {
	client: Wumpus;
	datasource!: DataSource;
	repositories: Map<string, Repository<any>> = new Map();

	constructor(client: Wumpus) {
		this.client = client;
		this.datasource = new DataSource({
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
	}

	async initialize() {
		await this.datasource.initialize().catch(() => {
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

			const repository = this.datasource.getRepository(entity);
			(this.client as any).repositories.set(token, repository);
		}
	}

	repository<T extends keyof RepositoriesMap>(
		name: T
	): Repository<RepositoriesMap[T]> | undefined {
		return this.repositories.get(name);
	}
}
