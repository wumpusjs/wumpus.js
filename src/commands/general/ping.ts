import { Locale } from "discord.js";
import Command from "../../classes/Command";

export default new Command({
	name: {
		"en-US": "ping",
		tr: "ping",
	},
	description: {
		"en-US": "Pong!",
		tr: "Pong!",
	},
	options: [
		{
			type: "STRING",
			description: {
				"en-US": "The user to ping",
				tr: "Ping atılacak kullanıcı",
			},
			name: {
				"en-US": "user",
				tr: "kullanıcı",
			},
			required: true,
		},
	] as const,
	execute: async (interaction, options) => {
		await interaction.reply("Pong!" + options.user);
	},
	defaultLocale: Locale.EnglishUS,
});
