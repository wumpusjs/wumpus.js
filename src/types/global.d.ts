import { z } from 'zod';
import { env } from '../utils/env';
import { Logger } from 'pino';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof env> {
			DEV_MODE: string;
		}
		logger: Logger;
		interface Global {
			logger: Logger;
		}
	}
}
