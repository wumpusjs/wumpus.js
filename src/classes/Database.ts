import { DataSource, Repository } from 'typeorm';
import path, { sep } from 'path';
import { getRepositoryToken } from '../utils/typeorm';
import { getFiles, getPath } from '../utils/file';
import Wumpus from '../structures/wumpus';
import { RepositoriesMap } from '../interfaces/repositories';

export default class Database {
	client: Wumpus;
	datasource!: DataSource;
	repositories: Map<string, Repository<any>> = new Map();

	constructor(client: Wumpus) {
		this.client = client;
		this.datasource = new DataSource({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			synchronize: process.env.ENVIRONMENT === 'development',
			entities: [
				path.join(__dirname, '../', `**${sep}entity`) +
					`${sep}*{.ts,.js}`,
			],
		});
	}

	async initialize() {
		const scanDir = ['src', 'dist'][+(process.env.DEV_MODE === 'true')];

		await this.datasource.initialize().catch(() => {
			global.logger('Failed to connect to database');
			process.exit(1);
		});

		const list = await getFiles('./entity', ['ts', 'js'], ['node_modules']);

		if (!list.success) return;

		for (const file of list.files) {
			const entity = require(getPath(`./entity/${file}`)).default;
			const token = getRepositoryToken(entity as any);

			const repository = this.datasource.getRepository(entity);

			if (typeof token !== 'string') {
				this.client.logger.error(
					`Failed to get repository token for ${file}`
				);
				return process.exit(1);
			}

			this.repositories.set(token, repository);
		}
	}

	repository<T extends keyof RepositoriesMap>(
		name: T
	): Repository<RepositoriesMap[T]> | undefined {
		return this.repositories.get(name);
	}
}
