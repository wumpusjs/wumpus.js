import { ActionRowBuilder, Locale } from 'discord.js';
import Command from '../../classes/Command';
import User from '../../entity/User';
import TestSelect from '../../selects/test';

export default new Command({
	name: {
		'en-US': 'test',
		tr: 'test',
	},
	description: {
		'en-US': 'Pong!',
		tr: 'Pong!',
	},
	options: [] as const,
	repositories: [User] as const,
	execute: async (interaction, options, client, userRepository) => {
		return await interaction.reply({
			content: 'Test',
			components: [
				new ActionRowBuilder().addComponents(
					(await client.selects.create(
						TestSelect as any,
						{
							test: 'test',
						},
						interaction.locale
					)) as any
				) as any,
			],
		});
	},
	defaultLocale: Locale.EnglishUS,
});
