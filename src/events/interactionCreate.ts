import { Events } from 'discord.js';
import Event from '../classes/Event';
import UncaughtError from '../templates/error';

export default new Event({
	event: Events.InteractionCreate,
	execute: async ([interaction], client) => {
		if (interaction.isCommand()) {
			try {
				await client?.command?.handleInteraction?.(interaction as any);
			} catch (error) {
				console.error(error);

				const handler =
					interaction.replied || interaction.deferred
						? interaction.followUp
						: interaction.reply;

				await handler({
					embeds: [
						UncaughtError.toEmbed(
							interaction.user,
							interaction.locale
						),
					],
					ephemeral: true,
				});
			}
		} else if (interaction.isButton()) {
			try {
				await client?.buttons?.handle(interaction);
			} catch (error) {
				console.error(error);

				const handler =
					interaction.replied || interaction.deferred
						? interaction.followUp
						: interaction.reply;

				await handler({
					embeds: [
						UncaughtError.toEmbed(
							interaction.user,
							interaction.locale
						),
					],
					ephemeral: true,
				});
			}
		}
	},
});
