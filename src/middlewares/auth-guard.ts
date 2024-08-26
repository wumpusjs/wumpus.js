import { Events } from 'discord.js';
import Middleware from '../classes/Middleware';
import RegistrationWall from '../templates/registration-wall';

export default new Middleware(
	Events.InteractionCreate,
	async ([interaction], next, client) => {
		if (!interaction.isCommand()) return next();

		const User = client.repository('UserRepository');

		if (!User) {
			return await interaction.reply('Something went wrong');
		}

		const user = await User.findOne({
			where: {
				id: interaction.user.id,
			},
		});

		if (!user) {
			return await interaction.reply({
				embeds: [
					RegistrationWall.toEmbed(interaction.locale),
				]
			});
		}

		next();
	}
);
