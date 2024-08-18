import { z } from 'zod';
import { error } from './logger';

export const env = z.object({
	APPLICATION_ID: z.string().regex(/^[0-9]+$/),
	TOKEN: z
		.string()
		.regex(/^[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+$/),
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

export function parseENV() {
	const parsed = env.safeParse(process.env);

	if (!parsed.success) {
		error('Failed to parse environment variables', parsed.error.toString());
		process.exit(1);
	}
}
