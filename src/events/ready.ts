import { Events } from "discord.js";
import Event from "../classes/Event";
import { info } from "../utils/logger";

export default new Event({
	event: Events.ClientReady,
	once: true,
	execute: (client) => {
		info(`Ready! Logged in as ${client.user.tag}`);
	},
});