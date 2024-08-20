import { ActionRowBuilder, ButtonBuilder, Locale } from 'discord.js';
import Command from '../../classes/Command';
import User from '../../entity/User';
import TestButton from '../../buttons/test';

export default new Command({
	name: {
		'en-US': 'ping',
		tr: 'ping',
	},
	description: {
		'en-US': 'Pong!',
		tr: 'Pong!',
	},
	options: [
		{
			type: 'USER',
			description: {
				'en-US': 'The user to ping',
				tr: 'Ping atılacak kullanıcı',
			},
			name: {
				'en-US': 'user',
				tr: 'kullanıcı',
			},
			required: true,
		},
	] as const,
	repositories: [User] as const,
	execute: async (interaction, options, userRepository) => {
		const user = await userRepository.findOne({
			where: {
				id: options.user.id,
			},
		});

		if (!user) {
			await interaction.reply({
				content: 'User not found!',
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						(await interaction.client.buttons.create(TestButton, {
							test: 'test',
						})) as ButtonBuilder
					),
				],
			});
			return;
		}

		await interaction.reply('Pong! ' + options.user.tag);
	},
	defaultLocale: Locale.EnglishUS,
});
