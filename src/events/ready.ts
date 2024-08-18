import { Events } from 'discord.js';
import Event from '../classes/Event';
import { success } from '../utils/logger';

export default new Event({
	event: Events.ClientReady,
	once: true,
	execute: (client) => {
		success(`Ready! Logged in as ${client.user.tag}`);
	},
});
