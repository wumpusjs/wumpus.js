import { z } from 'zod';
import Wumpus from '../structures/wumpus';

export const env = z.object({
	APPLICATION_ID: z.string().regex(/^[0-9]+$/),
	TOKEN: z
		.string()
		.regex(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/),
	DATABASE_HOST: z.string(),
	DATABASE_PORT: z
		.string()
		.regex(/^[0-9]+$/)
		.default('3306'),
	DATABASE_USER: z.string(),
	DATABASE_PASSWORD: z.string(),
	DATABASE_NAME: z.string(),
	ENVIRONMENT: z.enum(['development', 'production']),
});

export function parseENV(client: Wumpus) {
	const parsed = env.safeParse(process.env);

	if (!parsed.success) {
		client.logger.fatal(
			'Failed to parse environment variables',
			parsed.error.toString()
		);
		process.exit(1);
	}

	// @ts-ignore
	process.env.DEV_MODE = String(
		!!process[Symbol.for('ts-node.register.instance')]
	);

	if (process.env.DEV_MODE === 'true') {
		client.logger.info('ts-node detected, running in development mode');
	}
}
