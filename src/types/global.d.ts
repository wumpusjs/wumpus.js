import { z } from 'zod';
import { env } from '../utils/env';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof env> {}
	}
}
