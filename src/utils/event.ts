import { getFiles, getPath } from './file';
import path from 'path';
import Event from '../classes/Event';
import Middleware from '../classes/Middleware';
import Wumpus from '../structures/wumpus';

export const getEvents = () =>
	getFiles('./events', ['ts', 'js'], ['node_modules'], false);

export async function loadEvents(client: Wumpus) {
	const events = await getEvents();

	if (!events?.success) return client.logger.error('Failed to load evemts');

	if (!events.files.length) return client.logger.warn('No events found');

	events.files.forEach((event) => {
		const { default: exportedContent } = require(getPath(
			`./events/${event}`
		));

		if (!(exportedContent instanceof Event))
			return client.logger.error('Invalid event export:', event);

		client.middleware.addMiddleware(
			new Middleware(
				exportedContent.event,
				(args) => exportedContent.execute(args, client),
				Boolean(exportedContent.once)
			)
		);
	});
}
