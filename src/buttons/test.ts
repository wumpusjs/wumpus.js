import Button from '../classes/Button';
import User from '../entity/User';
import { ButtonStyle } from '../utils/button';

const TestButton = new Button({
	identifier: 'test',
	labels: {
		'en-US': 'Test Button',
	},
	style: ButtonStyle.Primary,
	fields: [
		{
			name: 'test',
			type: 'STRING',
		},
	] as const,
	repositories: [User],
	execute: async (interaction, options, userRepository) => {
		console.log(interaction);
		console.log(options);
		console.log(userRepository);
	},
});

export default TestButton;
