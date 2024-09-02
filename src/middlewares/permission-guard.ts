import { Events } from 'discord.js';
import Middleware from '../classes/Middleware';
import NotAnAdmin from '../templates/error/not-admin';
import { checkPermission } from '../utils/permission';

export default new Middleware(
	Events.InteractionCreate,
	async ([interaction], next, client) => {
		if (
			interaction.isCommand() &&
			!client.superusers.includes(interaction.user.id)
		) {
			const command = client.command.commands.get(
				interaction.commandName
			);
			const Permission = client.repository('PermissionRepository');
			if (command && command.permission && Permission) {
				if (
					!(await checkPermission(
						client,
						interaction.user.id,
						command.permission
					))
				) {
					return await interaction.reply({
						embeds: [
							NotAnAdmin.toEmbed(
								interaction.user,
								interaction.locale
							),
						],
					});
				}
			}
		}

		next();
	}
);
