import { Events } from 'discord.js';
import Event from '../classes/Event';

export default new Event({
	event: Events.InteractionCreate,
	execute: async (interaction) => {
		if (interaction.isCommand()) {
			try {
				await (
					interaction?.client as any
				)?.command?.handleInteraction?.(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content:
							'There was an error while executing this command!',
						ephemeral: true,
					});
				} else {
					await interaction.reply({
						content:
							'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
		} else if (interaction.isButton()) {
			try {
				await (interaction?.client as any)?.buttons?.handle(
					interaction
				);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content:
							'There was an error while executing this button!',
						ephemeral: true,
					});
				} else {
					await interaction.reply({
						content:
							'There was an error while executing this button!',
						ephemeral: true,
					});
				}
			}
		}
	},
});
