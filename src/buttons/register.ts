import Button from '../classes/Button';
import User from '../entity/User';
import AlreadyRegistered from '../templates/register/already-registered';
import SuccessfullyRegistered from '../templates/register/registered';
import { ButtonStyle } from '../utils/button';

const RegisterButton = new Button({
	identifier: 'register',
	labels: {
		'en-US': 'Accept the rules',
		tr: 'Kuralları kabul et',
	},
	style: ButtonStyle.Success,
	repositories: [User],
	execute: async (interaction, options, userRepository) => {
		const user = await userRepository.findOne({
			where: { id: interaction.user.id },
		});

		if (user) {
			await interaction.reply({
				embeds: [
					AlreadyRegistered.toEmbed(
						interaction.user,
						interaction.locale
					),
				],
				ephemeral: true,
			});
			return;
		}

		await userRepository.insert({
			id: interaction.user.id,
		});

		await interaction.reply({
			embeds: [
				SuccessfullyRegistered.toEmbed(
					interaction.user,
					interaction.locale
				),
			],
			ephemeral: true,
		});
	},
});

export default RegisterButton;
