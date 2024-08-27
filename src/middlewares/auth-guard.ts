import { ActionRowBuilder, ButtonBuilder, Events } from 'discord.js';
import Middleware from '../classes/Middleware';
import RegistrationWall from '../templates/register/registration-wall';
import RegisterButton from '../buttons/register';

export default new Middleware(
	Events.InteractionCreate,
	async ([interaction], next, client) => {
		if (interaction.isCommand()) {
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
						RegistrationWall.toEmbed(
							interaction.user,
							interaction.locale
						),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							(await client.buttons.create(
								RegisterButton,
								{},
								interaction.locale
							))!
						),
					],
				});
			}
		}

		next();
	}
);
