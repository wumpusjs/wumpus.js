import { Client } from 'discord.js';
import { DataSource } from 'typeorm';
import { success, error } from './logger';
import path, { sep } from 'path';

export async function attachDataSource(
	client: Client & { datasource: DataSource }
) {
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

	await client.datasource.initialize().catch(() => {
		error('Failed to connect to database');
		process.exit(1);
	});

	success('Database connected');
}
