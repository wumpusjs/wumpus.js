import { getFiles } from './file';
import MiddlewareManager from '../classes/MiddlewareManager';
import { error, warn } from './logger';
import path from 'path';
import Middleware from '../classes/Middleware';
import Wumpus from '../structures/wumpus';

export const getMiddlewares = () =>
	getFiles('./src/middlewares', ['ts', 'js'], ['node_modules']);

export async function loadMiddlewares(client: Wumpus) {
	const middlewares = await getMiddlewares();

	if (!middlewares?.success) return error('Failed to load commands');

	if (!middlewares.files.length) return warn('No commands found');

	if (!client.middleware) client.middleware = new MiddlewareManager(client);

	middlewares.files.forEach((middleware) => {
		const { default: exportedContent } = require(path.join(
			process.cwd(),
			'src/middlewares',
			middleware
		));

		if (!(exportedContent instanceof Middleware))
			return error(
				`Failed to load middleware ${middleware}, it does not export a Middleware instance`
			);

		client.middleware.addMiddleware(exportedContent);
	});
}
