import { getFiles } from './file';
import { error, warn } from './logger';
import path from 'path';
import Event from '../classes/Event';
import Middleware from '../classes/Middleware';
import Wumpus from '../structures/wumpus';

export const getEvents = () =>
	getFiles('./src/events', ['ts', 'js'], ['node_modules'], false);

export async function loadEvents(client: Wumpus) {
	const events = await getEvents();

	if (!events?.success) return error('Failed to load commands');

	if (!events.files.length) return warn('No commands found');

	events.files.forEach((event) => {
		const { default: exportedContent } = require(path.join(
			process.cwd(),
			'src/events',
			event
		)) as {
			default: Event<any>;
		};
		if (!(exportedContent instanceof Event))
			return error('Invalid event export:', event);

		client.middleware.addMiddleware(
			new Middleware(
				exportedContent.event,
				(args) => exportedContent.execute(args, client),
				!!exportedContent.once
			)
		);
	});
}
