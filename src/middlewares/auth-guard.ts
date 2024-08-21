import { Events } from 'discord.js';
import Middleware from '../classes/Middleware';

export default new Middleware(
	Events.InteractionCreate,
	async ([interaction], next) => {
		if (!interaction.isCommand()) return next();

		const User = interaction.client.repository('UserRepository');

		if (!User) {
			return await interaction.reply('Something went wrong');
		}

		const user = await User.findOne({
			where: {
				id: interaction.user.id,
			},
		});

		if (!user) {
			return await interaction.reply(
				'You must be registered to use this command'
			);
		}

		next();
	}
);
