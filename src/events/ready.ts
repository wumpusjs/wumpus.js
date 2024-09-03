import { Events } from 'discord.js';
import Event from '../classes/Event';

export default new Event({
	event: Events.ClientReady,
	once: true,
	execute: ([client], wumpus) => {
		wumpus.logger.info(`Ready! Logged in as ${client.user.tag}`);
	},
});
